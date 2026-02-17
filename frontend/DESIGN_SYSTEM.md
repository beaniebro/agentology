# Agentology Design System

Topology.vc-inspired minimalism. Near-black backgrounds, white text, clean sans-serif typography, numbered sections, generous whitespace.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0A0A0A` | Main background (near-black) |
| `--bg-secondary` | `#111111` | Card/section backgrounds |
| `--bg-elevated` | `#1A1A1A` | Modals, hover states |
| `--border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--border-hover` | `rgba(255,255,255,0.15)` | Hover borders |
| `--text-primary` | `#FAFAFA` | Headlines, primary text |
| `--text-secondary` | `#A1A1A1` | Body text, descriptions |
| `--text-muted` | `#666666` | Labels, metadata |
| `--accent` | `#FAFAFA` | CTAs, active states (white-on-black) |
| `--accent-hover` | `#D4D4D4` | Accent hover state |
| `--live` | `#EF4444` | Live indicators only |
| `--success` | `#22C55E` | Positive metrics |

## Typography

- **Display:** Inter (700, letter-spacing `-0.02em`)
- **Body:** Inter (400/500, normal tracking)
- **Mono:** JetBrains Mono (data, tokens, code)
- **No serif fonts.** Removed: Cormorant SC, EB Garamond, Tangerine

## Spacing & Layout

- Max-width container: `max-w-5xl` (tighter, more focused)
- Section padding: `py-24 md:py-32` (generous vertical breathing room)
- Numbered sections: `01.`, `02.` etc. in `text-muted` mono font
- Single-column flow for content, grid only for cards/stats

## Components

- **Cards:** `bg-[var(--bg-secondary)]`, `border border-[var(--border)]`, no blur/glass, `rounded-xl`
- **Buttons (primary):** White bg, black text, `rounded-lg`
- **Buttons (secondary):** Transparent bg, white border, `rounded-lg`
- **Links:** White with underline on hover, `->` suffix
- **Dividers:** Thin `border-[var(--border)]` lines, no ornate decorations
- **Badges:** Minimal pills with border only

## Animations

- **Keep:** `FadeInUp`, `FadeIn`, `FadeInLeft`, `FadeInRight`, `StaggerContainer`, `StaggerItem`, `HoverCard`
- **Reduced motion:** y: 15px (down from 30), shorter durations
- **Removed:** `GlowPulse`, `TextReveal`, `CountUp`, `HoverScale`, `ScaleIn`, golden particles, floating symbols, glow-pulse, border-glow
