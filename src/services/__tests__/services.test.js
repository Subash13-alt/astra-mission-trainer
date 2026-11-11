import test from 'node:test';
import assert from 'node:assert/strict';

import { askAdvisor, getHint, QUICK_QUESTIONS } from '../advisorService.js';
import { extractOsdrStudies, normalizeDonki } from '../nasaService.js';
import { createInitialState } from '../../engine/gameEngine.js';

const mk = (o = {}) => Object.assign(createInitialState({ now: 1 }), { pendingScenarioId: null }, o);

test('advisor answers every quick question in friendly, short text', () => {
  const s = mk();
  for (const q of QUICK_QUESTIONS) {
    const a = askAdvisor(q, s);
    assert.ok(a.length > 20 && a.length < 500, q);
  }
});

test('advisor explains electricity (example from the spec)', () => {
  const a = askAdvisor('Why should I save electricity?', mk());
  assert.match(a, /oxygen production/i);
  assert.match(a, /communication/i);
});

test('advisor works without any game state', () => {
  assert.ok(askAdvisor('What is radiation?', null).length > 10);
  assert.ok(getHint(null).length > 10);
});

test('advisor gives a safe answer to unknown or personal questions', () => {
  assert.match(askAdvisor('xyzzy', mk()), /not sure/i);
  assert.match(askAdvisor('my name is Sam and I live at 5 Oak St', mk()), /never share personal/i);
});

test('hints point to resources but never pick a scenario choice', () => {
  const s = mk();
  s.resources.water = 10;
  const hint = getHint(s);
  assert.match(hint, /Water/);
  assert.match(hint, /Recycle Water/);
  assert.doesNotMatch(hint, /you should (pick|choose|select)/i);

  const pending = mk({ pendingScenarioId: 'solar-storm' });
  assert.match(getHint(pending), /three choices/i);
});

test('DONKI records are normalised without inventing data', () => {
  const flare = normalizeDonki('FLR', { flrID: 'F1', beginTime: '2026-10-01T00:00Z', classType: 'M2.1', link: 'https://x' });
  assert.equal(flare.type, 'Solar flare');
  assert.equal(flare.name, 'M2.1-class solar flare');
  assert.equal(flare.source, 'NASA DONKI');

  const gst = normalizeDonki('GST', {
    gstID: 'G1',
    startTime: '2026-10-02T00:00Z',
    allKpIndex: [{ kpIndex: 4 }, { kpIndex: 6 }],
  });
  assert.equal(gst.name, 'Geomagnetic storm (Kp 6)');

  const cme = normalizeDonki('CME', { activityID: 'C1', startTime: '2026-10-03T00:00Z', note: 'x'.repeat(400) });
  assert.ok(cme.description.length <= 222);
});

test('OSDR parser only returns studies it can clearly identify', () => {
  const json = { hits: { hits: [{ _source: { 'Study Title': 'A study about cells in space', accession: 'OSD-137' } }, { _source: { foo: 1 } }] } };
  const out = extractOsdrStudies(json);
  assert.equal(out.length, 1);
  assert.equal(out[0].accession, 'OSD-137');
  assert.match(out[0].link, /OSD-137$/);
  assert.deepEqual(extractOsdrStudies({ nothing: 'here' }), []);
  assert.deepEqual(extractOsdrStudies(null), []);
});
