import React from 'react';
import { detectRecovery } from '../lib/workflow';

export default function RecoveryPanel({ result }) {
  if (!result) {
    return (
      <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
        <p className="text-sm text-on-surface-variant">
          No run yet â€” launch the Scout agent to see live browser/recovery status here.
        </p>
      </section>
    );
  }

  const recovery = detectRecovery(result.actionLog || [], !!result.simulatedFailure);

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 p-3">
          <p className="font-mono text-[10px] uppercase text-outline">WebCMD Browser</p>
          <p className={`text-sm font-semibold mt-1 ${result.browserAvailable ? 'text-emerald-400' : 'text-amber-300'}`}>
            {result.browserAvailable ? 'Available' : 'Unavailable â€” HTTP fallback in use'}
          </p>
        </div>
        <div className="rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 p-3">
          <p className="font-mono text-[10px] uppercase text-outline">Recovery Triggered</p>
          <p className={`text-sm font-semibold mt-1 ${recovery.recovered ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
            {recovery.recovered ? 'Yes' : 'No â€” not needed this run'}
          </p>
        </div>
        <div className="rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 p-3">
          <p className="font-mono text-[10px] uppercase text-outline">Mode</p>
          <p className="text-sm font-semibold mt-1 text-on-surface">
            {result.simulatedFailure ? 'Simulated demo' : 'Real run'}
          </p>
        </div>
      </div>

      {result.errors?.length > 0 && (
        <div className="rounded-lg border border-error/30 bg-error/5 p-3">
          <p className="font-mono text-[10px] uppercase text-error mb-1.5">Errors this run</p>
          <ul className="text-[12px] text-on-surface-variant font-mono space-y-0.5">
            {result.errors.map((e, i) => (
              <li key={i}>âš  {e}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-on-surface-variant leading-snug">
        {result.simulatedFailure
          ? 'This run used --simulate-browser-failure: a demo-safe simulation of the WebCMD-failure â†’ HTTP-recovery path, not a live browser failure.'
          : 'This run reflects real browser availability in the current environment: when the WebCMD runtime is not reachable, the agent automatically retries the same source over HTTP.'}
      </p>
    </section>
  );
}

