import { useState } from 'react';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { getMarsPhotos, getSpaceWeather, searchOsdr } from '../services/nasaService.js';
import { useNasaData } from '../hooks/useNasaData.js';
import { OSDR_INFO, ARTEMIS_INFO } from '../data/sampleNasaData.js';

/** Label that says where the data came from: live, saved copy or archived sample. */
export function SourceBadge({ source }) {
  if (source === 'live') return <span className="chip tag-live">🟢 Live NASA data</span>;
  if (source === 'cache') return <span className="chip tag-cache">💾 Saved NASA data</span>;
  return <span className="chip tag-archived">🗂️ Archived sample (not live)</span>;
}

function Status({ loading, result, retry }) {
  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-300" role="status">
        <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Contacting NASA…
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {result && <SourceBadge source={result.source} />}
      {result?.fetchedAt && (
        <span className="text-xs text-slate-400">Updated {new Date(result.fetchedAt).toLocaleString()}</span>
      )}
      <button type="button" className="btn btn-ghost !min-h-[36px] !px-3 !py-1 text-sm" onClick={retry}>
        <RefreshCw size={14} aria-hidden="true" /> Try again
      </button>
    </div>
  );
}

function ErrorNote({ result }) {
  if (!result?.error) return null;
  return (
    <p className="mt-2 rounded-xl bg-amber-400/10 p-2 text-xs text-amber-100" role="status">
      {result.error} The game still works. {result.source === 'archived' ? 'Showing an archived sample instead.' : 'Showing the last saved data.'}
    </p>
  );
}

/** Real space weather from NASA DONKI, kept clearly apart from simulated game risk. */
export function SpaceWeatherPanel({ risk, limit = 3, showSimulated = true }) {
  const { loading, result, retry } = useNasaData(getSpaceWeather, []);
  const [all, setAll] = useState(false);
  const items = result?.items || [];
  const shown = all ? items : items.slice(0, limit);

  return (
    <div>
      <h3 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-white">
        ☀️ Space Weather from NASA
      </h3>
      <p className="mb-2 text-xs text-slate-300">
        Real observations of the Sun from NASA’s DONKI database. They do <strong>not</strong> tell us the radiation at a
        Moon or Mars habitat.
      </p>
      <Status loading={loading} result={result} retry={retry} />
      <ErrorNote result={result} />

      {!loading && items.length === 0 && (
        <p className="mt-2 text-sm text-slate-300">No big space weather events were reported recently. A quiet Sun!</p>
      )}

      <ul className="mt-2 space-y-2">
        {shown.map((e) => (
          <li key={e.id} className="rounded-xl border border-white/10 bg-space-900/60 p-2.5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <strong className="text-white">{e.name}</strong>
              <span className="chip">{e.type}</span>
            </div>
            <p className="text-xs text-cyan-200">Observed: {String(e.date).slice(0, 16).replace('T', ' ')}</p>
            <p className="mt-1 text-xs leading-snug text-slate-200">{e.description}</p>
            <a
              href={e.link}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 underline"
            >
              {e.source} <ExternalLink size={12} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      {items.length > limit && (
        <button type="button" className="mt-2 text-sm font-semibold text-cyan-300 underline" onClick={() => setAll((a) => !a)}>
          {all ? 'Show fewer' : `Show all ${items.length} events`}
        </button>
      )}

      {showSimulated && risk && (
        <div className="mt-3 rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/10 p-2.5 text-sm">
          <span className="chip tag-sim mr-2">Simulated game value</span>
          <strong className="text-white">Space weather risk: {risk.label}</strong>
          <p className="mt-1 text-xs text-fuchsia-100">{risk.note} This is made up for the game and is not a measured radiation dose.</p>
        </div>
      )}
    </div>
  );
}

/** Real Mars rover photographs. */
export function MarsPhotosPanel({ rover = 'curiosity' }) {
  const { loading, result, retry } = useNasaData(
    (opts) => getMarsPhotos({ rover, ...opts }),
    [rover],
  );
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState({});
  const items = result?.items || [];
  const photo = items[index % Math.max(items.length, 1)];

  return (
    <div>
      <h3 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-white">📸 Photos from Mars</h3>
      <p className="mb-2 text-xs text-slate-300">Real pictures taken by NASA’s Mars rover.</p>
      <Status loading={loading} result={result} retry={retry} />
      <ErrorNote result={result} />

      {photo && (
        <figure className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-space-900/60">
          {broken[photo.id] ? (
            <div className="grid h-40 place-items-center text-sm text-slate-300">This picture could not be loaded.</div>
          ) : (
            <img
              src={photo.img}
              alt={`Mars photo from the ${photo.rover} rover, ${photo.cameraFull}, sol ${photo.sol}`}
              loading="lazy"
              className="h-48 w-full object-cover"
              onError={() => setBroken((b) => ({ ...b, [photo.id]: true }))}
            />
          )}
          <figcaption className="grid grid-cols-2 gap-x-3 gap-y-0.5 p-2.5 text-xs text-slate-200">
            <span><b className="text-white">Rover:</b> {photo.rover}</span>
            <span><b className="text-white">Camera:</b> {photo.cameraFull || photo.camera}</span>
            <span><b className="text-white">Earth date:</b> {photo.earthDate}</span>
            <span><b className="text-white">Sol:</b> {photo.sol} <span className="text-slate-400">(a Mars day)</span></span>
          </figcaption>
        </figure>
      )}
      {items.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          <button type="button" className="btn btn-ghost !min-h-[36px] !px-3 !py-1 text-sm" onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}>
            ← Previous
          </button>
          <span className="text-xs text-slate-300">
            {(index % items.length) + 1} of {items.length}
          </span>
          <button type="button" className="btn btn-ghost !min-h-[36px] !px-3 !py-1 text-sm" onClick={() => setIndex((i) => (i + 1) % items.length)}>
            Next →
          </button>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-400">Source: NASA Mars Rover Photos (api.nasa.gov)</p>
    </div>
  );
}

/** NASA Open Science Data Repository: links to real space biology studies. */
export function OsdrPanel() {
  const { loading, result, retry } = useNasaData((opts) => searchOsdr({ term: 'radiation', ...opts }), []);
  const items = result?.items || [];
  return (
    <div>
      <h3 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-white">🧬 NASA Open Science Data Repository</h3>
      <p className="text-sm text-slate-200">{OSDR_INFO.intro}</p>
      <p className="mt-2 rounded-xl bg-amber-400/10 p-2 text-xs text-amber-100">{OSDR_INFO.note}</p>

      <div className="mt-3">
        <Status loading={loading} result={result} retry={retry} />
      </div>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {items.map((s) => (
            <li key={s.accession} className="rounded-xl border border-white/10 bg-space-900/60 p-2.5 text-sm">
              <span className="chip mr-2">{s.accession}</span>
              <span className="text-slate-100">{s.title}</span>
              <a href={s.link} target="_blank" rel="noreferrer noopener" className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-300 underline">
                Open study on OSDR <ExternalLink size={12} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <p className="mt-2 text-sm text-slate-300">
            We could not list studies right now. You can explore them directly on NASA’s site.
          </p>
        )
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <a className="btn btn-ghost !min-h-[40px] text-sm" href={OSDR_INFO.searchUrl} target="_blank" rel="noreferrer noopener">
          Search “radiation” on OSDR <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a className="btn btn-ghost !min-h-[40px] text-sm" href={OSDR_INFO.homeUrl} target="_blank" rel="noreferrer noopener">
          OSDR home <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

/** NASA Artemis explainer with links to the official page. */
export function ArtemisPanel() {
  return (
    <div>
      <h3 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-white">🌕 NASA Artemis</h3>
      <p className="text-sm text-slate-200">{ARTEMIS_INFO.intro}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
        {ARTEMIS_INFO.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-400">{ARTEMIS_INFO.note}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ARTEMIS_INFO.links.map((l) => (
          <a key={l.url} className="btn btn-ghost !min-h-[40px] text-sm" href={l.url} target="_blank" rel="noreferrer noopener">
            {l.label} <ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
