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
            Scout scores results against this profile in real time â€” degree, year, interests, skills, and location.
          </p>
        </div>
      </div>
    </aside>
  );
}

