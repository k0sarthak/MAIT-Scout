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

