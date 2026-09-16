import React from 'react';
import { STAGES, groupLogByStage, detectRecovery } from '../lib/workflow';

export default function WorkflowTrace({ isRunning, result, elapsedMs }) {
  if (!isRunning && !result) return null;

  const stageGroups = result ? groupLogByStage(result.actionLog || []) : {};
  const recovery = result ? detectRecovery(result.actionLog || [], !!result.simulatedFailure) : null;

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">memory</span>
          Agent Run Trace
        </h2>
        {isRunning ? (
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Runningâ€¦
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Complete
            {typeof elapsedMs === 'number' && <span className="text-outline normal-case">Â· {(elapsedMs / 1000).toFixed(2)}s</span>}
          </span>
        )}
      </div>

      {isRunning && !result && (
        <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-secondary/40 via-secondary to-secondary/40 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full" />
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2">
          {STAGES.map((stage) => {
            const lines = stageGroups[stage.id] || [];
            const hasContent = lines.length > 0;
            return (
              <details key={stage.id} open={false} className="group rounded-lg border border-surface-container-high/40 bg-surface-container-low/60">
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer select-none">
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <span className={`material-symbols-outlined text-[15px] ${hasContent ? 'text-emerald-400' : 'text-outline'}`}>
                      {hasContent ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {stage.label}
                  </span>
                  <span className="font-mono text-[10px] text-outline">{lines.length} log line{lines.length === 1 ? '' : 's'}</span>
                </summary>
                {hasContent && (
                  <div className="px-3 pb-2.5 pt-0.5 font-mono text-[11px] text-on-surface-variant space-y-0.5">
                    {lines.map((l, idx) => (
                      <div key={idx} className="truncate">{l}</div>
                    ))}
                  </div>
                )}
              </details>
            );
          })}

          {/* Recovery visualization */}
          {recovery && (recovery.hadFailure || recovery.simulatedFailure) && (
            <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Recovery Path {recovery.simulatedFailure ? '(simulated demo)' : '(real â€” browser runtime unavailable)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                {['WebCMD action', 'Failure', 'Diagnose', 'HTTP fallback', 'Extraction'].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">{step}</span>
                    {i < arr.length - 1 && <span className="text-outline">â†’</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2">
                {recovery.simulatedFailure
                  ? 'This is a demo-safe simulation of the recovery path, not a live browser failure.'
                  : 'The WebCMD browser runtime was not reachable in this environment, so the agent automatically fell back to its HTTP path â€” a real (not simulated) recovery.'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

