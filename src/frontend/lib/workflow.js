/**
 * Maps the ScoutAgent's real actionLog lines onto the 6 demo stages.
 * This is purely presentational grouping of logs the backend already
 * produced â€” it does not re-implement or duplicate any agent logic.
 */

export const STAGES = [
  { id: 'OBSERVE', label: 'Observe', desc: 'Reads the profile and inspects which sources are relevant' },
  { id: 'PLAN', label: 'Plan', desc: 'Parses the request into opportunity types and picks sources' },
  { id: 'ACT', label: 'Act', desc: 'Drives WebCMD browser, falls back to direct HTTP automatically' },
  { id: 'EXTRACT', label: 'Extract', desc: 'Normalizes raw per-source results into one shared schema' },
  { id: 'VALIDATE', label: 'Validate', desc: 'Drops expired / inactive listings before scoring' },
  { id: 'RANK', label: 'Rank', desc: 'Heuristically scores and sorts against the student profile' },
];

export function classifyEntry(entry) {
  const e = entry.toLowerCase();
  if (
    e.includes('starting opportunity discovery') ||
    e.includes('initializing browser') ||
    e.includes('inspecting ')
  ) return 'OBSERVE';

  if (e.includes('intent understood') || e.includes('sources selected')) return 'PLAN';

  if (
    e.includes('browser initialized') || e.includes('browser unavailable') ||
    e.includes('using browser') || e.includes('using http fallback') ||
    e.includes('browser action failed') || e.includes('diagnosing failure') ||
    e.includes('recovery strategy') || e.includes('retrying via http') ||
    e.includes('recovery successful') || e.includes('continuing pipeline') ||
    e.includes('browser error') || e.includes('http error') || e.includes('simulated')
  ) return 'ACT';

  if (
    e.includes('âœ“') || e.includes('âœ—') ||
    e.includes('normalizing candidates') || e.includes('normalized ') ||
    e.includes('extraction failed')
  ) return 'EXTRACT';

  if (e.includes('filtering')) return 'VALIDATE';

  if (e.includes('ranking complete')) return 'RANK';

  return null;
}

export function groupLogByStage(actionLog = []) {
  const groups = Object.fromEntries(STAGES.map((s) => [s.id, []]));
  actionLog.forEach((entry) => {
    const stage = classifyEntry(entry);
    if (stage) groups[stage].push(entry);
  });
  return groups;
}

/**
 * Detects whether a real (or simulated) browser->HTTP recovery happened,
 * from the actual log content â€” never inferred/fabricated.
 */
export function detectRecovery(actionLog = [], simulatedFailure = false) {
  const joined = actionLog.join('\n').toLowerCase();
  const hadFailure = joined.includes('browser action failed') || joined.includes('browser unavailable');
  const diagnosed = joined.includes('diagnosing failure') || joined.includes('recovery strategy');
  const usedHttp = joined.includes('using http fallback') || joined.includes('retrying via http');
  const recovered = joined.includes('recovery successful') || (hadFailure && usedHttp);
  return { hadFailure, diagnosed, usedHttp, recovered, simulatedFailure };
}

