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

        const sourcesOk = (data.actionLog || []).filter((l) => l.includes('âœ“')).length;
        const sourcesTotal = (data.actionLog || []).filter((l) => l.includes('âœ“') || l.includes('âœ—')).length;

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
                runId={result?.timestamp ? result.timestamp.slice(11, 19) : 'â€”'}
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
                Full profile editing isn't part of this MVP â€” the student profile shown in the
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

