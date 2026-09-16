import React from 'react';
import { STAGES } from '../lib/workflow';

const ICONS = {
  OBSERVE: 'visibility',
  PLAN: 'route',
  ACT: 'directions_run',
  EXTRACT: 'data_object',
  VALIDATE: 'check_circle',
  RANK: 'sort',
};

const TITLES = {
  OBSERVE: 'Read Profile & Sources',
  PLAN: 'Parse Intent',
  ACT: 'WebCMD Browser + HTTP Fallback',
  EXTRACT: 'Normalize Schema',
  VALIDATE: 'Drop Inactive Listings',
  RANK: 'Score Against Profile',
};

export default function AgentCapabilities({ activeStage, doneStages = [] }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
          Agent Capabilities Breakdown
        </h2>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-secondary uppercase tracking-wider">
          6-stage pipeline
        </span>
      </div>
      <p className="text-xs text-on-surface-variant mb-4 max-w-2xl">
        Scout doesn't just call one API â€” it selects sources per request, drives a real browser
        session when available, and falls back to direct HTTP automatically when it isn't.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STAGES.map((stage, i) => {
          const isActive = activeStage === stage.id;
          const isDone = doneStages.includes(stage.id);
          return (
            <div
              key={stage.id}
              className={`rounded-xl border p-3 transition-all ${
                isActive
                  ? 'bg-secondary/10 border-secondary/50 shadow-[0_0_12px_rgba(123,208,255,0.15)]'
                  : isDone
                  ? 'bg-surface-container-low border-emerald-500/30'
                  : 'bg-surface-container-low border-surface-container-high/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-secondary' : 'text-outline'}`}>
                  {String(i + 1).padStart(2, '0')} {stage.id}
                </span>
                <span className={`material-symbols-outlined text-[16px] ${isDone ? 'text-emerald-400' : isActive ? 'text-secondary' : 'text-outline'}`}>
                  {isDone ? 'check_circle' : ICONS[stage.id]}
                </span>
              </div>
              <p className="text-sm font-medium text-on-surface">{TITLES[stage.id]}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{stage.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

