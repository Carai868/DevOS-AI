# PyRunner IDE — Design Brainstorm

## Context
A self-hosted IDE + Python automation platform. Mobile-responsive. Features: Monaco Editor, file tree, AI chat sidebar, CMD+K command palette, PyRunner scheduling/execution panel, run logs.

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement**: Brutalist Developer Tool / Raw Terminal Aesthetic
**Core Principles**:
1. Monochrome-first with a single electric accent (neon green #00FF87) — everything else is near-black or off-white
2. Hard edges, no border-radius, thick 1px borders — structure is exposed, not hidden
3. Dense information layout — every pixel earns its place, no decorative whitespace
4. Typography does the heavy lifting — size contrast replaces color contrast

**Color Philosophy**: Background `#0D0D0D`, surface `#141414`, borders `#2A2A2A`, accent `#00FF87` (neon green for active states, run indicators, AI responses). The green references terminal culture and signals "live / running."

**Layout Paradigm**: Three-column split — narrow file tree (200px) | editor (flex) | right panel (320px collapsible). On mobile: bottom sheet navigation with swipe-up panels. No rounded cards — panels are hard-bordered rectangles.

**Signature Elements**:
1. Blinking cursor `▋` used as loading indicator everywhere
2. Monospace font (JetBrains Mono) for ALL text — including UI labels, not just code
3. Status bar at the very bottom (VSCode-style) with live run count, connection status

**Interaction Philosophy**: Every action has an immediate terminal-style echo. Clicking "Run" shows `> executing script.py...` in the log panel. No modals — everything is inline drawers or inline panels.

**Animation**: Minimal — only opacity transitions (100ms). No scale, no slide. Cursor blink is the primary motion. Log lines stream in with 20ms stagger.

**Typography System**: JetBrains Mono 400/700 for everything. Size scale: 11px labels, 13px body, 15px headings, 20px panel titles.

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement**: Obsidian / Notion-inspired Dark Knowledge Tool
**Core Principles**:
1. Warm dark tones (not cold blue-black) — charcoal with slight brown undertones
2. Generous padding and breathing room — the IDE feels like a premium notebook
3. Subtle depth through layered surfaces (3 levels of darkness)
4. Accent color: amber/gold `#F59E0B` for highlights, active states, AI elements

**Color Philosophy**: Background `#1C1917` (warm stone-900), surface `#292524`, elevated `#3C3836`. Amber accent creates warmth and feels editorial rather than cold-tech. Muted text in `#A8A29E`.

**Layout Paradigm**: Left sidebar (collapsible, 240px) with icon rail on mobile. Editor fills center. Right panel slides in as an overlay on mobile. Generous 16px gutters between panels.

**Signature Elements**:
1. Rounded pill badges for script status (Running, Scheduled, Failed) in amber/red/green
2. Subtle grain texture on sidebar background (CSS noise filter)
3. Soft glow on the active editor tab (box-shadow with amber tint)

**Interaction Philosophy**: Smooth and unhurried. Panels animate in with 250ms ease-out. Hovering a file shows a gentle background highlight. The AI chat feels like a conversation, not a terminal.

**Animation**: Slide-in panels (translateX 250ms ease-out), fade-in content (150ms), tab switches with crossfade. Stagger file tree items 30ms each on load.

**Typography System**: "Outfit" (sans-serif) for UI labels and headings, "Fira Code" for code and log output. Heading scale: 24px/18px/14px. Body 13px.

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement**: Cyberpunk Dev Console / Synthwave Terminal
**Core Principles**:
1. Deep navy-black base with electric blue and magenta accents
2. Scanline / CRT texture overlaid at very low opacity on panels
3. Glowing borders on active elements (box-shadow with color)
4. Information density is high but organized by color-coded zones

**Color Philosophy**: Background `#080B14`, surface `#0E1525`, accent-primary `#3B82F6` (electric blue), accent-secondary `#A855F7` (purple). Green `#10B981` for success/running states. The palette references classic terminal + sci-fi.

**Layout Paradigm**: Full-screen split with a collapsible left rail (icon-only on mobile). Editor center. Bottom panel for terminal/logs. Right panel for AI/PyRunner. All panels have glowing top borders in their zone color.

**Signature Elements**:
1. Glowing top-border on each panel in its zone color (blue = editor, purple = AI, green = runner)
2. Hex grid subtle background pattern on the landing/empty state
3. Animated "pulse" dot on running scripts

**Interaction Philosophy**: Responsive and kinetic. Buttons have a brief flash on click. Running scripts show a pulsing green dot. Log lines stream with a typing effect.

**Animation**: Button press: scale(0.96) 120ms. Panel open: translateY from bottom 200ms cubic-bezier(0.23,1,0.32,1). Log stream: each line fades+slides in 40ms stagger.

**Typography System**: "Space Grotesk" for UI, "JetBrains Mono" for code. Headers bold 600, labels 500. Accent text uses gradient (blue→purple) for AI-related elements.

</idea>
</response>

---

## Selected Design: **Approach 1 — Brutalist Developer Tool**

Rationale: It most authentically matches the developer-tool use case, avoids "AI slop" aesthetics (no purple gradients, no rounded cards, no Inter), and creates a distinctive identity. The neon green terminal accent is immediately recognizable as a code execution tool.
