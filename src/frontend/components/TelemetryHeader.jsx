import React from 'react';

export default function TelemetryHeader({
  runId,
  status,
  elapsedTime,
  requestQuery,
  pipelineProgress,
  simulateFailure,
  setSimulateFailure,
  onRunAgent,
  onHaltAgent,
  isRunning
}) {
  return (
    <div class="px-6 py-4 bg-surface-container-lowest border-b border-surface-container-high/40 flex flex-col gap-3 shadow-sm">
      {/* Top Bar: Status, Timer, Simulation Toggle */}
      <div class="flex flex-wrap items-center justify-between gap-4">
        {/* Run Identifier & State */}
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high border border-surface-container-highest">
            <span class="material-symbols-outlined text-[15px] text-secondary">memory</span>
            <span class="font-mono text-xs font-semibold text-on-surface tracking-tight">{runId}</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-md shadow-sm border ${
            status === 'RUNNING' || status === 'EXECUTING'
              ? 'bg-secondary-container/20 border-secondary/40 text-secondary'
              : status === 'RECOVERING'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : status === 'COMPLETE'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-surface-container-high border-surface-container-highest text-outline'
          }`}>
            <span class="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status === 'COMPLETE' ? 'bg-emerald-400' : status === 'RECOVERING' ? 'bg-amber-400' : 'bg-secondary'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                status === 'COMPLETE' ? 'bg-emerald-400' : status === 'RECOVERING' ? 'bg-amber-400' : 'bg-secondary'
              }`}></span>
            </span>
            <span class="font-mono text-[11px] font-bold tracking-wider uppercase">
              STATUS: {status}
            </span>
          </div>

          <div class="hidden sm:flex items-center gap-2 font-mono text-xs text-outline">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            <span>Elapsed: <strong class="text-on-surface">{elapsedTime}s</strong></span>
            <span class="text-surface-container-highest">•</span>
            <span>Engine: <strong class="text-secondary font-semibold">webcmd-cluster</strong></span>
          </div>
        </div>

        {/* Action Controls & Simulation Toggle */}
        <div class="flex items-center gap-3">
          {/* Failure Simulation Toggle */}
          <button
            onClick={() => setSimulateFailure(!simulateFailure)}
            title="Toggles intentional WebCMD browser navigation timeout to demonstrate automated HTTP recovery flow"
            class={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              simulateFailure
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span class={`material-symbols-outlined text-[15px] ${simulateFailure ? 'text-amber-400' : 'text-outline'}`}>
              warning
            </span>
            <span>{simulateFailure ? 'Simulate Browser Fail: ON' : 'Simulate Browser Fail: OFF'}</span>
          </button>

          {/* Trigger / Halt Button */}
          {isRunning ? (
            <button
              onClick={onHaltAgent}
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-error/20 border border-error/40 hover:bg-error/30 text-error text-xs font-semibold transition-all shadow-sm"
            >
              <span class="material-symbols-outlined text-[15px]">pause</span>
              <span>Halt Agent</span>
            </button>
          ) : (
            <button
              onClick={() => onRunAgent(requestQuery)}
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed-dim font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Run Scout Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Task Banner & Macro Pipeline Progress Bar */}
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        <div class="flex items-start md:items-center gap-3 min-w-0">
          <div class="p-1.5 rounded-lg bg-surface-container-highest flex-shrink-0 text-secondary border border-secondary/20">
            <span class="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] text-outline uppercase font-semibold">Active Prompt Synthesis</span>
              <span class="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                Target: 2nd Year CSE MAIT
              </span>
            </div>
            <p class="text-sm font-medium text-on-surface truncate mt-0.5">
              “{requestQuery}”
            </p>
          </div>
        </div>

        {/* Macro Progress */}
        <div class="flex items-center gap-4 flex-shrink-0">
          <div class="flex flex-col items-end min-w-[140px]">
            <div class="flex items-center justify-between w-full font-mono text-[11px]">
              <span class="text-on-surface-variant">Pipeline Progress</span>
              <span class="text-secondary font-bold">{pipelineProgress}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-1.5 border border-surface-container-high">
              <div
                class="h-full bg-gradient-to-r from-secondary/80 to-secondary rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(123,208,255,0.4)]"
                style={{ width: `${pipelineProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
