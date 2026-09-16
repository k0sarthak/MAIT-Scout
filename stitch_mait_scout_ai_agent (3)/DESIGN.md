---
name: Autonomous Intelligence
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#bdc2ff'
  on-tertiary: '#131e8c'
  tertiary-container: '#7c87f3'
  on-tertiary-container: '#081486'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#000767'
  on-tertiary-fixed-variant: '#2f3aa3'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-metric:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a focused, precision-engineered developer-tool aesthetic tailored for high-agency college builders, competitive programmers, and undergraduate researchers operating at the bleeding edge. Rooted in the visual lineages of Linear and Raycast, the aesthetic balances intense technical utility with high-end digital craftsmanship. 

The visual style blends Dark Minimalist Engineering with subtle Frosted Glassmorphism:
- **Atmospheric Density:** An ultra-deep space aesthetic using calibrated dark hues that prioritize visual hierarchy over absolute pitch black, eliminating glare while enhancing focus.
- **Instrument Precision:** Razor-thin structural borders, live pulse signals, and sub-pixel optical alignments reflect an autonomous agent operating deterministically under the hood.
- **Telemetry-First Feedback:** Agent activity—such as crawling, synthesis, and heuristic ranking—is treated as first-class UI, transforming passive loading sequences into engaging, transparent operations.
- **Restraint Over Decoration:** Zero superfluous flourishes or gratuitous glows. Color serves semantic telemetry, interaction cues, and verified opportunity match confidence.

## Colors

The palette establishes an intentional contrast between abyssal structural backdrops and high-luminance informational cues. Color conveys cognitive priority and state awareness.

### Palette Architecture
- **Canvas & Base Tiers:**
  - `bg-base`: `#090A0F` (Root application canvas)
  - `bg-subtle`: `#0D0F17` (Sidebar navigation, secondary panels)
  - `bg-surface`: `#131622` (Panels, input wrappers, inactive containers)
- **Surfaces & Overlays:**
  - `surface-elevated`: `#181C2A` (Standard cards, modules)
  - `surface-hover`: `#1F2438` (Interactive hover targets, active card surfaces)
  - `surface-glass`: `rgba(24, 28, 42, 0.72)` paired with `backdrop-blur-md`
- **Structural Borders:**
  - `border-hairline`: `#272D45` (1px baseline divider, card outline)
  - `border-active`: `#3E476E` (Focused state, selected row)
  - `border-accent-subtle`: `rgba(99, 102, 241, 0.35)`
- **Accents & Telemetry:**
  - Primary Indigo: `#6366F1` (Action nodes, keyboard focus indicators, agent decisions)
  - Indigo Glow: `#818CF8` (Hover text on interactive actions, badge borders)
  - Cyan Data: `#38BDF8` (Telemetry streams, live browser hooks, token consumption metrics)
- **System States:**
  - Validation / High Match: `#10B981` (Verified deadlines, eligibility matches >90%)
  - Recovery / Warning: `#F59E0B` (Approaching deadlines, incomplete profile inputs)
  - Fallback / Error: `#F43F5E` (Broken links, failed extractions, expired tracks)
- **Typography Tokens:**
  - Primary Text: `#F8FAFC` (High-contrast, pure legibility)
  - Muted Text: `#94A3B8` (Metadata, secondary keys, inactive labels)
  - Faint Text: `#64748B` (Timestamps, keyboard shortcuts, disabled nodes)

## Typography

The type system pairs modern geometric clarity with monospace structural rigor:

- **Primary Interface Font (Geist):** Handles product UI, natural language prompts, opportunity names, and descriptions. Its tight geometric design and subtle aperture geometry ensure crystal-clear density even in multi-column data views.
- **Telemetry & Terminal Font (JetBrains Mono):** Drives agent phase tags, JSON extraction previews, latency meters, match percentages, code syntax snippets, and command shortcuts (`⌘K`, `Shift+P`).
- **Tracking & Proportion:** Headlines use slightly negative letter-spacing (`-0.02em` to `-0.025em`) to maintain structural tension. Monospace caps use wider letter-spacing (`0.06em`) for readability in micro-badges.
- **Tabular Numerics:** All numbers within score metrics, payout/stipend figures, and dates must be rendered with tabular lining figures (`tnum`) to eliminate jitter during real-time updates.

## Layout & Spacing

The layout model is built around a structured, data-dense work surface inspired by modern IDE command desks and keyboard-centric utilities.

### Structural Framework
- **Grid Architecture:** 12-column variable grid on desktop screens (`≥1024px`), transforming to an 8-column layout on tablet devices (`768px-1023px`), and a single unified column stream on mobile (`<768px`).
- **The Split View Model:** The main workspace defaults to an asymmetric split on screens `≥1280px`:
  - 35% Agent Telemetry & Browser Session Dock: Terminal log streams, agent action history, and DOM tree traversal feeds.
  - 65% Intelligence Canvas: Filtered candidate cards, opportunity pipelines, matrix comparisons, and match profiles.
- **Command Palette Anchoring:** Top-center anchored command bar (`max-w-2xl`) floating 12vh below the viewport ceiling with an omnipresent z-index.
- **Spacing Rhythm:** Based strictly on a 4px sub-grid (`0.25rem`), prioritizing information efficiency without suffocating reading comfort. Micro-spacings (`space-xs`, `space-sm`) structure dense telemetry blocks, while `space-lg` and `space-xl` partition distinct contextual groups.

## Elevation & Depth

Visual hierarchy does not rely on heavy, blurred drop shadows. Depth is established through structural border luminescence, semi-transparent stacking, and background attenuation.

- **Base Layer (Level 0):** Pure `#090A0F`. Non-interactive structural backplane.
- **Docked Canvas (Level 1):** `#0D0F17` framed by a 1px `#272D45` border. Used for background splits, navigation trees, and passive list rails.
- **Surfaces & Cards (Level 2):** `#181C2A` with 1px border `#272D45`. Receives top-edge highlight (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`) simulating a crisp directional light source.
- **Floating Glass & Overlays (Level 3):** Modal sheets, command bars, and active inspection drawers leverage `rgba(24, 28, 42, 0.85)` with `backdrop-filter: blur(12px)` and a dynamic edge shadow `0 20px 40px -15px rgba(0, 0, 0, 0.7)`.
- **Active Focus & Agent Accentuation:** When an element is selected or actively targeted by the agent, the border switches to `#6366F1` with an outer trace glow: `0 0 0 1px #6366F1, 0 0 16px -4px rgba(99, 102, 241, 0.3)`.

## Shapes

The design system uses a sharp-to-moderately soft silhouette (`roundedness: 1`). It rejects bubbly, overly rounded interfaces in favor of mechanical precision.

- **Micro Components (0.25rem / 4px):** Code tags, keybind badges, terminal status boxes, action checkboxes, and inner list highlights.
- **Cards & Core Panels (0.5rem / 8px):** Opportunity cards, agent inspection drawer, filter panels, telemetry log windows.
- **Floating Modals & Command Bars (0.75rem / 12px):** `⌘K` command bar, master search inputs, onboarding prompts.
- **Pill Exception (9999px / Full Radius):** Reserved strictly for **Agent Phase Indicators** (`OBSERVE`, `PLAN`, `ACT`, `EXTRACT`, `VALIDATE`, `RANK`), pulse chips, and match confidence badges. This intentional roundness makes temporal agent statuses immediately recognizable against the geometric cards.

## Components

### 1. Command Bar (`⌘K` Raycast-Inspired)
- Centered, `w-full max-w-[640px]`, background `rgba(19, 22, 34, 0.85)`, backdrop blur `16px`, 1px border in `#272D45`.
- Input field contains zero browser outlines, stark white placeholder `#F8FAFC`, paired with a trailing pill shortcut indicator displaying `ESC` or `↵ ENTER` in JetBrains Mono.
- Suggestion rows feature muted category labels (`Hackathon`, `Lab Grant`, `Internship`) and switch to background `#1F2438` with an active indicator accent bar on the left edge (`2px solid #6366F1`).

### 2. Agent Phase Badges
- Pill shape with micro-caps monospaced text (`label-caps`).
- Height: 20px, inline padding: 8px.
- States:
  - `OBSERVE`: Background `rgba(56, 189, 248, 0.1)`, text `#38BDF8`, 1px border `rgba(56, 189, 248, 0.3)`.
  - `PLAN`: Background `rgba(129, 140, 248, 0.1)`, text `#818CF8`, 1px border `rgba(129, 140, 248, 0.3)`.
  - `ACT`: Background `rgba(99, 102, 241, 0.15)`, text `#A5B4FC`, 1px border `#6366F1`, paired with a live 6px pulsing dot.
  - `EXTRACT`: Background `rgba(245, 158, 11, 0.1)`, text `#F59E0B`, 1px border `rgba(245, 158, 11, 0.3)`.
  - `VALIDATE`: Background `rgba(16, 185, 129, 0.1)`, text `#10B981`, 1px border `rgba(16, 185, 129, 0.3)`.
  - `RANK`: Background `rgba(244, 63, 94, 0.1)`, text `#F43F5E`, 1px border `rgba(244, 63, 94, 0.3)`.

### 3. Opportunity Cards (Hackathons, Internships, Research)
- Background `#181C2A`, border 1px solid `#272D45`, transition duration `150ms`.
- Hover behavior: Background shifts to `#1F2438`, border switches to `#3E476E`, cursor changes to pointer.
- Header: Opportunity title in Geist Medium, accompanied by a tabular match percentage pill (`98% MATCH` in Emerald `#10B981`).
- Body: Deadline countdown (e.g., `T-minus 4d 12h`), host entity (e.g., `MIT Media Lab`, `Stripe Accelerator`), and parsed eligibility pills (`Undergrad`, `US/Remote`, `Python/Rust`).
- Footer: Agent discovery attribution (e.g., `Discovered via Hacker News Launch • 12m ago`).

### 4. Live Agent Telemetry Console
- Background `#0D0F17`, inner padding `12px`, border 1px solid `#272D45`, JetBrains Mono typography.
- Displays line-numbered agent execution streams:
  ```
  [02:14:08] OBSERVE  Navigating to lab.mit.edu/admissions...
  [02:14:09] EXTRACT  Found 3 PI openings (Quantum/ML).
  [02:14:10] VALIDATE Checking deadline against academic calendar -> MATCH.
  ```
- Fast-updating variables (token counters, latency, DOM query depth) rendered in Cyan `#38BDF8`.

### 5. Buttons & Triggers
- **Primary Button:** Deep electric indigo `#6366F1`, text `#F8FAFC`, subtle top-inner bevel (`inset 0 1px 0 rgba(255,255,255,0.2)`). Hover: `#4F46E5`. Active: Scale down `98%`.
- **Secondary / Ghost Button:** Background `rgba(255, 255, 255, 0.03)`, border 1px solid `#272D45`, text `#94A3B8`. Hover: Text becomes `#F8FAFC`, background becomes `rgba(255, 255, 255, 0.07)`.
- **Keyboard Shortcut Indicators:** Integrated into buttons (`K`, `↵`, `Tab`) framed in micro-boxes (`0.25rem` radius, border `#272D45`, font `JetBrains Mono 10px`).

### 6. Filter Chips & Toggle Segments
- Low profile: 26px height.
- Inactive: Border 1px solid `#272D45`, text `#94A3B8`.
- Active: Border 1px solid `#6366F1`, background `rgba(99, 102, 241, 0.12)`, text `#F8FAFC`.
- Interactive transitions are immediate (sub-100ms ease-out) to sustain responsive developer-grade feedback.