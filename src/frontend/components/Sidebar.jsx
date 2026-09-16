import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, opportunitiesCount = 0 }) {
  const navItems = [
    { id: 'scout', label: 'Scout Console', icon: 'explore', badge: 'LAUNCH', badgeColor: 'text-outline' },
    { id: 'agent-run', label: 'Agent Graph', icon: 'terminal', live: true },
    { id: 'opportunities', label: 'Opportunities', icon: 'folder_special', count: opportunitiesCount },
    { id: 'recovery-and-health', label: 'Recovery & Health', icon: 'shield_with_heart', badge: '99.9%', badgeColor: 'text-secondary' },
    { id: 'profile', label: 'Student Profile', icon: 'account_tree', badge: 'CSE', badgeColor: 'text-outline' },
  ];

  return (
    <aside class="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-surface-container-high/40 shadow-xl">
      <div class="flex flex-col">
        {/* Header Branding */}
        <div class="h-16 px-6 flex items-center justify-between border-b border-surface-container-high/30 bg-surface-container-low/60">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center border border-secondary/20 shadow-inner">
              <span class="material-symbols-outlined text-secondary text-[22px]">radar</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-lg text-on-surface tracking-tight leading-none">MAIT Scout</span>
              <span class="text-[10px] font-mono text-outline mt-0.5">Opportunity Agent</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-mono text-[10px] font-bold uppercase tracking-wider">
            v1.4
          </span>
        </div>

        {/* Navigation Items */}
        <nav class="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                class={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                  isActive
                    ? 'bg-surface-container-high text-on-surface font-semibold shadow-inner border border-secondary/15'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div class="flex items-center gap-3">
                  <span class={`material-symbols-outlined text-[18px] ${isActive ? 'text-secondary' : 'text-outline'}`}>
                    {item.icon}
                  </span>
                  <span class="text-sm font-medium">{item.label}</span>
                </div>

                {item.live && (
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <span class="font-mono text-[10px] font-bold text-secondary uppercase">LIVE</span>
                  </div>
                )}

                {item.count !== undefined && (
                  <span class="font-mono text-xs text-secondary font-bold px-2 py-0.5 rounded bg-surface-container-highest">
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span class={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-low ${item.badgeColor || 'text-outline'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Powered by WebCMD & Student Profile Footer */}
      <div class="p-3 flex flex-col gap-3 border-t border-surface-container-high/40 bg-surface-container-lowest">
        {/* Official WebCMD Infrastructure Endorsement */}
        <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex flex-col gap-2 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] font-semibold text-outline uppercase tracking-wider">INFRASTRUCTURE</span>
            <span class="flex items-center gap-1 font-mono text-[10px] text-secondary font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Active
            </span>
          </div>
          <div class="p-2.5 rounded-lg bg-black border border-surface-container-high/80 flex items-center justify-center my-0.5">
            <img
              src="/assets/webcmd-wordmark.svg"
              alt="WebCMD Wordmark"
              class="h-7 w-auto object-contain max-w-full"
            />
          </div>
          <div class="flex items-center justify-between text-on-surface-variant font-mono text-[11px]">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px] text-secondary">terminal</span>
              Dual Headless
            </span>
            <span class="text-secondary font-bold">Engine Ready</span>
          </div>
        </div>

        {/* Student User Badge */}
        <div class="p-2.5 rounded-xl bg-surface-container flex items-center justify-between border border-surface-container-high/30">
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-semibold text-on-surface truncate">Aarav Sharma</span>
            <span class="font-mono text-[11px] text-on-surface-variant truncate">2nd Year CSE (MAIT)</span>
          </div>
          <div class="w-7 h-7 rounded-full bg-surface-container-highest border border-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary">
            <span class="material-symbols-outlined text-[16px]">school</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
