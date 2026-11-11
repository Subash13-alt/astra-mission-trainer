/**
 * NASA data service.
 *
 * Real NASA observations are always labelled as such; fallback content is
 * labelled "archived". Every function returns a result and never throws, so
 * a NASA outage can never break the game.
 *
 * The browser only talks to this site's own /api/nasa and /api/osdr paths
 * (see vite.config.js and /api). The NASA API key stays on the server side.
 *
 * Result shape: { items, source: 'live' | 'cache' | 'archived', fetchedAt, error? }
 */
import { ARCHIVED_MARS_PHOTOS, ARCHIVED_SPACE_WEATHER } from '../data/sampleNasaData.js';
import { readCache, writeCache } from './storageService.js';

const HOUR = 60 * 60 * 1000;
const TTL = { weather: 3 * HOUR, mars: 12 * HOUR, osdr: 24 * HOUR };

export class NasaError extends Error {
  constructor(message, kind = 'network') {
    super(message);
    this.kind = kind; // 'rate-limit' | 'http' | 'network' | 'timeout' | 'parse'
  }
}

async function fetchJson(url, { timeoutMs = 9000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (res.status === 429) throw new NasaError('NASA is busy right now (rate limit).', 'rate-limit');
    if (!res.ok) throw new NasaError(`NASA answered with an error (${res.status}).`, 'http');
    try {
      return await res.json();
    } catch {
      throw new NasaError('NASA sent something we could not read.', 'parse');
    }
  } catch (err) {
    if (err instanceof NasaError) throw err;
    if (err?.name === 'AbortError') throw new NasaError('NASA took too long to answer.', 'timeout');
    throw new NasaError('Could not reach NASA.', 'network');
  } finally {
    clearTimeout(timer);
  }
}

/** Try once more after a short pause, unless NASA told us to slow down. */
async function fetchWithRetry(url) {
  try {
    return await fetchJson(url);
  } catch (err) {
    if (err.kind === 'rate-limit' || err.kind === 'parse') throw err;
    await new Promise((r) => setTimeout(r, 800));
    return fetchJson(url);
  }
}

const ymd = (d) => d.toISOString().slice(0, 10);
const clip = (text, n = 220) => (text && text.length > n ? `${text.slice(0, n).trim()}…` : text || '');

/** Turn DONKI records into one simple shape. */
export function normalizeDonki(type, item) {
  if (type === 'FLR') {
    const cls = item.classType ? `${item.classType}-class ` : '';
    return {
      id: item.flrID || `flr-${item.beginTime}`,
      type: 'Solar flare',
      name: `${cls}solar flare`,
      date: item.beginTime,
      description:
        clip(item.note) ||
        `A sudden flash of light and energy from the Sun${item.sourceLocation ? ` (near ${item.sourceLocation})` : ''}.`,
      link: item.link || 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
      source: 'NASA DONKI',
    };
  }
  if (type === 'CME') {
    return {
      id: item.activityID || `cme-${item.startTime}`,
      type: 'Coronal mass ejection',
      name: 'Coronal mass ejection (CME)',
      date: item.startTime,
      description:
        clip(item.note) || 'A huge cloud of gas and magnetic energy thrown out by the Sun.',
      link: item.link || 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
      source: 'NASA DONKI',
    };
  }
  const kp = Math.max(0, ...(item.allKpIndex || []).map((k) => Number(k.kpIndex) || 0));
  return {
    id: item.gstID || `gst-${item.startTime}`,
    type: 'Geomagnetic storm',
    name: kp ? `Geomagnetic storm (Kp ${kp})` : 'Geomagnetic storm',
    date: item.startTime,
    description: 'A disturbance of Earth’s magnetic bubble, often caused by activity from the Sun.',
    link: item.link || 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
    source: 'NASA DONKI',
  };
}

/** Real space weather events from the last 30 days (NASA DONKI). */
export async function getSpaceWeather({ force = false } = {}) {
  if (!force) {
    const cached = readCache('weather', TTL.weather);
    if (cached?.value?.items?.length) return { ...cached.value, source: 'cache' };
  }

  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * HOUR);
  const query = `startDate=${ymd(start)}&endDate=${ymd(end)}`;
  const types = ['FLR', 'CME', 'GST'];

  const results = await Promise.allSettled(
    types.map((t) => fetchWithRetry(`/api/nasa/DONKI/${t}?${query}`)),
  );

  const items = [];
  let firstError = null;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      r.value.forEach((rec) => items.push(normalizeDonki(types[i], rec)));
    } else if (r.status === 'rejected' && !firstError) {
      firstError = r.reason;
    }
  });

  const anySucceeded = results.some((r) => r.status === 'fulfilled' && Array.isArray(r.value));
  if (anySucceeded) {
    items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const value = { items: items.slice(0, 12), source: 'live', fetchedAt: Date.now(), error: null };
    writeCache('weather', value);
    return value;
  }

  const stale = readCache('weather', Infinity);
  if (stale?.value?.items?.length) {
    return { ...stale.value, source: 'cache', error: firstError?.message || null };
  }
  return {
    items: ARCHIVED_SPACE_WEATHER,
    source: 'archived',
    fetchedAt: null,
    error: firstError?.message || 'NASA space weather is not available.',
  };
}

function normalizeMarsPhoto(p) {
  return {
    id: String(p.id),
    rover: p.rover?.name || 'Mars rover',
    camera: p.camera?.name || '',
    cameraFull: p.camera?.full_name || p.camera?.name || '',
    earthDate: p.earth_date,
    sol: p.sol,
    img: String(p.img_src || '').replace(/^http:\/\//, 'https://'),
  };
}

/** Latest photos from a Mars rover (NASA Mars Rover Photos). */
export async function getMarsPhotos({ rover = 'curiosity', force = false } = {}) {
  const cacheName = `mars-${rover}`;
  if (!force) {
    const cached = readCache(cacheName, TTL.mars);
    if (cached?.value?.items?.length) return { ...cached.value, source: 'cache' };
  }
  try {
    const data = await fetchWithRetry(`/api/nasa/mars-photos/api/v1/rovers/${rover}/latest_photos`);
    const photos = (data?.latest_photos || data?.photos || []).map(normalizeMarsPhoto).filter((p) => p.img);
    if (photos.length === 0) throw new NasaError('No rover photos were returned.', 'parse');
    const value = { items: photos.slice(0, 6), source: 'live', fetchedAt: Date.now(), error: null };
    writeCache(cacheName, value);
    return value;
  } catch (err) {
    const stale = readCache(cacheName, Infinity);
    if (stale?.value?.items?.length) return { ...stale.value, source: 'cache', error: err.message };
    return { items: ARCHIVED_MARS_PHOTOS, source: 'archived', fetchedAt: null, error: err.message };
  }
}

/**
 * Look through an OSDR search response for study titles + accession numbers.
 * The response format can change, so this reads it defensively and returns
 * only what it can clearly identify (never invented data).
 */
export function extractOsdrStudies(json) {
  const found = new Map();
  const titleKeys = ['title', 'Study Title', 'study title', 'Project Title', 'project title', 'name'];

  const visit = (node, depth = 0) => {
    if (!node || depth > 8) return;
    if (Array.isArray(node)) {
      node.forEach((n) => visit(n, depth + 1));
      return;
    }
    if (typeof node !== 'object') return;

    const titleKey = titleKeys.find((k) => typeof node[k] === 'string' && node[k].trim().length > 3);
    if (titleKey) {
      const accession = JSON.stringify(node).match(/OSD-\d{1,4}/i)?.[0]?.toUpperCase();
      if (accession && !found.has(accession)) {
        found.set(accession, {
          accession,
          title: clip(node[titleKey].trim(), 140),
          link: `https://osdr.nasa.gov/bio/repo/data/studies/${accession}`,
        });
      }
    }
    Object.values(node).forEach((v) => visit(v, depth + 1));
  };

  visit(json);
  return [...found.values()].slice(0, 6);
}

/** Public research studies from NASA OSDR that match a keyword. */
export async function searchOsdr({ term = 'radiation', force = false } = {}) {
  const cacheName = `osdr-${term}`;
  if (!force) {
    const cached = readCache(cacheName, TTL.osdr);
    if (cached?.value?.items?.length) return { ...cached.value, source: 'cache' };
  }
  try {
    const data = await fetchWithRetry(`/api/osdr/search?term=${encodeURIComponent(term)}&from=0&type=cgene`);
    const items = extractOsdrStudies(data);
    if (items.length === 0) throw new NasaError('OSDR answered, but no studies could be listed.', 'parse');
    const value = { items, source: 'live', fetchedAt: Date.now(), error: null };
    writeCache(cacheName, value);
    return value;
  } catch (err) {
    const stale = readCache(cacheName, Infinity);
    if (stale?.value?.items?.length) return { ...stale.value, source: 'cache', error: err.message };
    return { items: [], source: 'archived', fetchedAt: null, error: err.message };
  }
}
