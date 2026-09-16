# Run this from inside your project root:
# C:\Users\sarth\OneDrive\Desktop\WebCMD Agent
# powershell -ExecutionPolicy Bypass -File setup-frontend.ps1

Write-Host "Creating frontend files..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "vite.config.js" -Encoding UTF8 -Value @'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/frontend',
  publicDir: '../../public',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});

'@
Write-Host "  wrote vite.config.js"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\lib\workflow.js" -Encoding UTF8 -Value @'
/**
 * Maps the ScoutAgent's real actionLog lines onto the 6 demo stages.
 * This is purely presentational grouping of logs the backend already
 * produced — it does not re-implement or duplicate any agent logic.
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
    e.includes('✓') || e.includes('✗') ||
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
 * from the actual log content — never inferred/fabricated.
 */
export function detectRecovery(actionLog = [], simulatedFailure = false) {
  const joined = actionLog.join('\n').toLowerCase();
  const hadFailure = joined.includes('browser action failed') || joined.includes('browser unavailable');
  const diagnosed = joined.includes('diagnosing failure') || joined.includes('recovery strategy');
  const usedHttp = joined.includes('using http fallback') || joined.includes('retrying via http');
  const recovered = joined.includes('recovery successful') || (hadFailure && usedHttp);
  return { hadFailure, diagnosed, usedHttp, recovered, simulatedFailure };
}

'@
Write-Host "  wrote src\frontend\lib\workflow.js"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\lib\api.js" -Encoding UTF8 -Value @'
/**
 * Thin client for the existing Express API (server.js).
 * No agent logic lives here — this only calls the real backend.
 */

export async function runScout({ request, profile, simulateBrowserFailure = false, verbose = false }) {
  const res = await fetch('/api/scout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request, profile, simulateBrowserFailure, verbose }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Scout request failed (HTTP ${res.status})`);
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Scout request failed (HTTP ${res.status})`);
  }

  return data;
}

export async function getStatus() {
  const res = await fetch('/api/status');
  return res.json();
}

'@
Write-Host "  wrote src\frontend\lib\api.js"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\App.jsx" -Encoding UTF8 -Value @'
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TelemetryHeader from './components/TelemetryHeader';
import Hero from './components/Hero';
import IntentConsole from './components/IntentConsole';
import AgentCapabilities from './components/AgentCapabilities';
import WorkflowTrace from './components/WorkflowTrace';
import RecentRuns from './components/RecentRuns';
import OpportunitiesList from './components/OpportunitiesList';
import StudentProfileMatrix from './components/StudentProfileMatrix';
import RecoveryPanel from './components/RecoveryPanel';
import { runScout } from './lib/api';
import { classifyEntry } from './lib/workflow';

const DEFAULT_PROFILE = {
  degree: 'B.Tech CSE',
  year: 2,
  interests: ['AI', 'ML', 'Data Science'],
  skills: ['Python', 'C++'],
  location: 'Delhi',
};

const DEFAULT_REQUEST = "Find opportunities I can apply to. I'm a 2nd-year CSE student interested in AI/ML.";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('scout');
  const [searchInput, setSearchInput] = useState(DEFAULT_REQUEST);
  const [activeCategory, setActiveCategory] = useState('all');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(null);
  const [runHistory, setRunHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const submit = useCallback(
    async (requestText) => {
      const request = (requestText || '').trim();
      if (!request || isRunning) return;

      setIsRunning(true);
      setErrorMsg(null);
      setResult(null);
      const startedAt = Date.now();

      try {
        const data = await runScout({
          request,
          profile: DEFAULT_PROFILE,
          simulateBrowserFailure: simulateFailure,
        });

        setResult(data);
        setElapsedMs(Date.now() - startedAt);

        const sourcesOk = (data.actionLog || []).filter((l) => l.includes('✓')).length;
        const sourcesTotal = (data.actionLog || []).filter((l) => l.includes('✓') || l.includes('✗')).length;

        setRunHistory((prev) => [
          {
            id: data.timestamp,
            query: request,
            finishedAgo: timeAgo(data.timestamp),
            opportunitiesCount: data.opportunities?.length ?? 0,
            sourcesOk,
            sourcesTotal,
            topScore: data.opportunities?.[0]?.score,
            simulatedFailure: !!data.simulatedFailure,
            fullResult: data,
          },
          ...prev,
        ].slice(0, 10));
      } catch (err) {
        setErrorMsg(err.message || 'Scout request failed');
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, simulateFailure]
  );

  const selectRun = useCallback(
    (id) => {
      const run = runHistory.find((r) => r.id === id);
      if (run) {
        setResult(run.fullResult);
        setSearchInput(run.query);
        setActiveTab('opportunities');
      }
    },
    [runHistory]
  );

  // Derive current/completed stage set for the capabilities grid highlight.
  const doneStages = result
    ? [...new Set((result.actionLog || []).map(classifyEntry).filter(Boolean))]
    : [];

  return (
    <div className="min-h-screen">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        opportunitiesCount={result?.opportunities?.length ?? 0}
      />

      <Header
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearchSubmit={submit}
        isRunning={isRunning}
      />

      <main className="ml-72 pt-16 px-6 pb-10 flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {activeTab === 'scout' && (
            <>
              <Hero />

              <IntentConsole
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={submit}
                isRunning={isRunning}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                simulateFailure={simulateFailure}
                onToggleSimulateFailure={setSimulateFailure}
              />

              {errorMsg && (
                <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                  {errorMsg}
                </div>
              )}

              <WorkflowTrace isRunning={isRunning} result={result} elapsedMs={elapsedMs} />

              <AgentCapabilities
                activeStage={isRunning ? null : undefined}
                doneStages={doneStages}
              />

              <RecentRuns runs={runHistory} onSelectRun={selectRun} />
            </>
          )}

          {activeTab === 'agent-run' && (
            <>
              <TelemetryHeader
                runId={result?.timestamp ? result.timestamp.slice(11, 19) : '—'}
                status={isRunning ? 'RUNNING' : result ? 'COMPLETE' : 'IDLE'}
                elapsedTime={elapsedMs ? (elapsedMs / 1000).toFixed(1) : '0.0'}
                requestQuery={searchInput}
                pipelineProgress={isRunning ? 60 : result ? 100 : 0}
                simulateFailure={simulateFailure}
                setSimulateFailure={setSimulateFailure}
                onRunAgent={submit}
                onHaltAgent={() => {}}
                isRunning={isRunning}
              />
              <WorkflowTrace isRunning={isRunning} result={result} elapsedMs={elapsedMs} />
            </>
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesList opportunities={result?.opportunities} />
          )}

          {activeTab === 'recovery-and-health' && <RecoveryPanel result={result} />}

          {activeTab === 'profile' && (
            <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
              <p className="text-sm text-on-surface-variant">
                Full profile editing isn't part of this MVP — the student profile shown in the
                right panel is what every run is actually scored against.
              </p>
            </section>
          )}
        </div>

        <StudentProfileMatrix profile={DEFAULT_PROFILE} browserAvailable={result?.browserAvailable} />
      </main>
    </div>
  );
}

'@
Write-Host "  wrote src\frontend\App.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\Hero.jsx" -Encoding UTF8 -Value @'
import React from 'react';

export default function Hero() {
  return (
    <section className="pt-10 pb-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-secondary/20 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-secondary">
          Autonomous Browser Agent
        </span>
        <span className="font-mono text-[10px] text-outline">v1.4.2 runtime</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-on-surface leading-tight max-w-2xl">
        Stop searching. <span className="text-secondary">Let Scout find it.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-on-surface-variant leading-relaxed">
        An autonomous browser agent that discovers, validates, and prioritizes opportunities
        from fragmented student portals like Unstop, Devfolio, and MAIT campus notices.
      </p>
    </section>
  );
}

'@
Write-Host "  wrote src\frontend\components\Hero.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\IntentConsole.jsx" -Encoding UTF8 -Value @'
import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', phrase: "Find opportunities I can apply to. I'm a 2nd-year CSE student interested in AI/ML." },
  { id: 'hackathon', label: 'Hackathons', phrase: 'Find AI/ML hackathons for me' },
  { id: 'internship', label: 'Internships', phrase: 'Find AI/ML internships for a 2nd-year CSE student' },
  { id: 'competition', label: 'Competitions', phrase: 'Find AI/ML competitions I can enter' },
  { id: 'scholarship', label: 'Scholarships', phrase: 'Find scholarships for a CSE student' },
  { id: 'event', label: 'Events', phrase: 'Find campus events and workshops at MAIT' },
];

export default function IntentConsole({
  value,
  onChange,
  onSubmit,
  isRunning,
  activeCategory,
  onSelectCategory,
  simulateFailure,
  onToggleSimulateFailure,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim() && !isRunning) onSubmit(value);
  };

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-outline flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">terminal</span>
          Agent Intent Discovery Console
        </span>
        <span className="font-mono text-[10px] text-outline">
          Profile attached: <span className="text-secondary font-semibold">CSE_2ND_YEAR</span>
        </span>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 px-4 py-3 focus-within:border-secondary/50 transition-colors">
          <span className="material-symbols-outlined text-secondary text-[20px]">smart_toy</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder="Find opportunities I can apply to. I'm a 2nd-year CSE student interested in AI/ML."
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="px-5 py-3 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            disabled={isRunning}
            onClick={() => {
              onSelectCategory(cat.id);
              onChange(cat.phrase);
            }}
            className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wide border transition-all ${
              activeCategory === cat.id
                ? 'bg-secondary/20 border-secondary/50 text-secondary'
                : 'bg-surface-container border-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-surface-container-high/40 bg-surface-container-low/40">
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Engine: WebCMD Browser + HTTP Fallback
          </span>
          <span className="hidden sm:inline">3 sources: Unstop, Devfolio, MAIT</span>
          <button
            type="button"
            onClick={() => onToggleSimulateFailure(!simulateFailure)}
            title="Runs a demo-safe simulation of the browser-failure → HTTP-recovery path"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              simulateFailure
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-surface-container border-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">warning</span>
            {simulateFailure ? 'Simulate failure: ON' : 'Simulate failure: OFF'}
          </button>
        </div>

        <button
          type="button"
          disabled={isRunning || !value.trim()}
          onClick={() => onSubmit(value)}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isRunning ? 'progress_activity' : 'rocket_launch'}
          </span>
          {isRunning ? 'Running Scout Mission…' : 'Launch Scout Agent'}
        </button>
      </div>
    </section>
  );
}

'@
Write-Host "  wrote src\frontend\components\IntentConsole.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\AgentCapabilities.jsx" -Encoding UTF8 -Value @'
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
        Scout doesn't just call one API — it selects sources per request, drives a real browser
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

'@
Write-Host "  wrote src\frontend\components\AgentCapabilities.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\WorkflowTrace.jsx" -Encoding UTF8 -Value @'
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
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Running…
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Complete
            {typeof elapsedMs === 'number' && <span className="text-outline normal-case">· {(elapsedMs / 1000).toFixed(2)}s</span>}
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
                  Recovery Path {recovery.simulatedFailure ? '(simulated demo)' : '(real — browser runtime unavailable)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                {['WebCMD action', 'Failure', 'Diagnose', 'HTTP fallback', 'Extraction'].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">{step}</span>
                    {i < arr.length - 1 && <span className="text-outline">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2">
                {recovery.simulatedFailure
                  ? 'This is a demo-safe simulation of the recovery path, not a live browser failure.'
                  : 'The WebCMD browser runtime was not reachable in this environment, so the agent automatically fell back to its HTTP path — a real (not simulated) recovery.'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

'@
Write-Host "  wrote src\frontend\components\WorkflowTrace.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\RecentRuns.jsx" -Encoding UTF8 -Value @'
import React from 'react';

export default function RecentRuns({ runs, onSelectRun }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
          Recent Autonomous Runs
        </h2>
      </div>

      {runs.length === 0 ? (
        <p className="text-xs text-on-surface-variant">
          No runs yet this session — launch the agent above to see runs appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 hover:border-secondary/40 px-3 py-2.5 text-left transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm text-on-surface truncate">Query: {run.query}</p>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  Finished {run.finishedAgo} · {run.opportunitiesCount} ranked opportunities · {run.sourcesOk}/{run.sourcesTotal} sources ok
                  {run.simulatedFailure ? ' · recovery demo' : ''}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="font-mono text-[10px] text-outline uppercase">Top score</span>
                <span className="font-mono text-sm font-bold text-secondary">{run.topScore ?? '—'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

'@
Write-Host "  wrote src\frontend\components\RecentRuns.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\StudentProfileMatrix.jsx" -Encoding UTF8 -Value @'
import React from 'react';

export default function StudentProfileMatrix({ profile, browserAvailable }) {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
      <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-outline">Powered by Engine</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${browserAvailable ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
            {browserAvailable === false ? 'HTTP mode' : 'Online'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-black border border-surface-container-high/80 flex items-center justify-center">
          <img src="/assets/webcmd-wordmark.svg" alt="WebCMD Wordmark" className="h-7 w-auto object-contain max-w-full" />
        </div>
        <p className="font-mono text-[11px] text-on-surface-variant mt-2">Autonomous Headless Runtime</p>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-4 flex-1">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-container-high/40">
          <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary font-bold text-xs">
            AS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">Aarav Sharma</p>
            <p className="font-mono text-[11px] text-secondary truncate">
              Year {profile.year} {profile.degree} @ MAIT Delhi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-b border-surface-container-high/40 font-mono text-[11px]">
          <div>
            <p className="text-outline uppercase text-[10px]">Degree</p>
            <p className="text-on-surface-variant">{profile.degree}</p>
          </div>
          <div>
            <p className="text-outline uppercase text-[10px]">Location</p>
            <p className="text-on-surface-variant">{profile.location}</p>
          </div>
        </div>

        <div className="py-3 border-b border-surface-container-high/40">
          <p className="font-mono text-[10px] uppercase text-outline mb-1.5">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] text-secondary font-mono">
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="py-3">
          <p className="font-mono text-[10px] uppercase text-outline mb-1.5">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] text-on-surface-variant font-mono">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-1 p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/40 flex items-start gap-2">
          <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5">info</span>
          <p className="text-[11px] text-on-surface-variant leading-snug">
            Scout scores results against this profile in real time — degree, year, interests, skills, and location.
          </p>
        </div>
      </div>
    </aside>
  );
}

'@
Write-Host "  wrote src\frontend\components\StudentProfileMatrix.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\OpportunitiesList.jsx" -Encoding UTF8 -Value @'
import React from 'react';

const REASON_LABELS = {
  degreeMatch: 'CSE match',
  yearMatch: 'year eligible',
  interestMatch: 'AI/ML interest',
  skillMatch: 'skill match',
  locationMatch: 'Delhi/Remote',
  urgency: 'active deadline',
};

function reasonsFor(opp) {
  const breakdown = opp.scoreData?.breakdown || {};
  return Object.keys(breakdown)
    .filter((k) => REASON_LABELS[k])
    .map((k) => REASON_LABELS[k]);
}

export default function OpportunitiesList({ opportunities }) {
  if (!opportunities || opportunities.length === 0) {
    return (
      <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
        <p className="text-sm text-on-surface-variant">
          No ranked opportunities yet — launch the Scout agent to populate this list with real results.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">folder_special</span>
          Ranked Opportunities
        </h2>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-secondary">
          {opportunities.length} total
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {opportunities.map((opp, idx) => {
          const reasons = reasonsFor(opp);
          return (
            <a
              key={`${opp.url}-${idx}`}
              href={opp.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 hover:border-secondary/40 px-3 py-2.5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase">
                    {opp.type}
                  </span>
                  <span className="font-mono text-[10px] text-outline">{opp.source}</span>
                </div>
                <p className="text-sm text-on-surface mt-1 truncate">{opp.title || 'Untitled opportunity'}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {opp.deadline ? `Deadline: ${opp.deadline}` : 'Deadline: not specified'}
                  {reasons.length > 0 ? ` · ${reasons.join(' + ')}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end">
                <span className="font-mono text-[10px] text-outline uppercase">Score</span>
                <span className="font-mono text-base font-bold text-secondary">{opp.score}</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

'@
Write-Host "  wrote src\frontend\components\OpportunitiesList.jsx"

New-Item -ItemType Directory -Force -Path "" | Out-Null
Set-Content -Path "src\frontend\components\RecoveryPanel.jsx" -Encoding UTF8 -Value @'
import React from 'react';
import { detectRecovery } from '../lib/workflow';

export default function RecoveryPanel({ result }) {
  if (!result) {
    return (
      <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
        <p className="text-sm text-on-surface-variant">
          No run yet — launch the Scout agent to see live browser/recovery status here.
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
            {result.browserAvailable ? 'Available' : 'Unavailable — HTTP fallback in use'}
          </p>
        </div>
        <div className="rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 p-3">
          <p className="font-mono text-[10px] uppercase text-outline">Recovery Triggered</p>
          <p className={`text-sm font-semibold mt-1 ${recovery.recovered ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
            {recovery.recovered ? 'Yes' : 'No — not needed this run'}
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
              <li key={i}>⚠ {e}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-on-surface-variant leading-snug">
        {result.simulatedFailure
          ? 'This run used --simulate-browser-failure: a demo-safe simulation of the WebCMD-failure → HTTP-recovery path, not a live browser failure.'
          : 'This run reflects real browser availability in the current environment: when the WebCMD runtime is not reachable, the agent automatically retries the same source over HTTP.'}
      </p>
    </section>
  );
}

'@
Write-Host "  wrote src\frontend\components\RecoveryPanel.jsx"

Write-Host "Done. Now run: npm install ; npm run frontend" -ForegroundColor Green