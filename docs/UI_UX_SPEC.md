# TravelMate AI — UI/UX Spec
# Agent 08: UI/UX Design — W5-01
# Transport Upgrade: New Result Cards, Nearby Labels, Transfer Risk Badges

---

## 1. Design Principles

- **Honest provenance first**: every card shows its data source badge prominently
- **No surprises**: nearby-node labels must be visible before the user taps a result
- **Risk = colour**: transfer risk badge colour is the primary visual signal
- **Mobile-first**: cards stack vertically on 375 px viewports; two-column on ≥768 px

---

## 2. Provenance Badge Spec

| Provenance Value | Badge Label | Colour Token | Icon |
|-----------------|-------------|-------------|------|
| `LIVE_PROVIDER_DATA` | Live Data | `emerald-500` | ✦ |
| `TIMETABLE` | Timetable (2016) | `amber-500` | 🕐 |
| `ESTIMATE` | Estimate | `slate-400` | ~ |
| `PROVIDER_VERIFICATION_REQUIRED` | Verify before booking | `red-400` | ⚠ |

**Placement**: top-right corner of every result card, pill shape, 11 px font.

---

## 3. Nearby-Node Label Spec

When a result has `nearbyNote` populated, show a **secondary label** directly below
the station/airport name:

```
📍 From Kollam Jn, 65 km from your origin
```

- Font: 12 px, `text-slate-400`
- Icon: 📍 (location pin emoji) or a custom map-pin SVG
- Colour: `amber-300` text when `nearbyDistKm > 50`; `slate-400` when ≤ 50
- Must appear on BOTH origin and destination sides if both are nearby fallbacks

**Rail nearby card example:**
```
┌─────────────────────────────────┐
│ Karnataka Express (12627)   TIMETABLE │
│ Kollam Jn → Bengaluru              │
│ 📍 From Kollam Jn, 65 km from your origin │
│ Dep 06:40 · Arr 16:15 · 9h 35m    │
│ ₹465 (SL) · Running days: unknown  │
│ [Book on IRCTC ↗]                  │
└─────────────────────────────────┘
```

---

## 4. Transfer Risk Badge Spec

Shown on combination route cards at the transfer point:

| Risk Level | Label | Background | Border | Text |
|-----------|-------|-----------|--------|------|
| `LOW` | ✓ Safe Connection | `emerald-950/40` | `emerald-500/40` | `emerald-200` |
| `MEDIUM` | ⚡ Tight Connection | `amber-950/50` | `amber-500/40` | `amber-200` |
| `HIGH` | ⚠ High Risk | `red-950/60` | `red-500/50` | `red-200` |

**Badge content:**
```
⚡ Tight Connection
   95 min buffer · MCT 90 min
   "Monitor delays closely."
```

Font: 12 px. Placed inside the transfer divider between leg 1 and leg 2 cards.

---

## 5. Combination Route Card Layout

```
╔══════════════════════════════════════╗
║  🚂 Train + ✈ Flight           LIVE  ║
║  Delhi → Mumbai · 7h 20m · ₹4,200   ║
╠══════════════════════════════════════╣
║  LEG 1 — Train                       ║
║  Rajdhani Express (12952)            ║
║  NDLS 16:00 → AGC 18:30             ║
║  2h 30m · ₹850 · 2A                 ║
╠═══════ ⚡ TIGHT CONNECTION ══════════╣
║  Transfer at Agra Cantt               ║
║  95 min wait · MCT 180 min            ║
║  ⚠ Allow 3h min for airport transit  ║
╠══════════════════════════════════════╣
║  LEG 2 — Flight                      ║
║  IndiGo 6E-123                        ║
║  AGR 20:05 → BOM 22:00              ║
║  1h 55m · ₹3,350 · Economy          ║
╠══════════════════════════════════════╣
║  [Book Leg 1 ↗]  [Book Leg 2 ↗]    ║
╚══════════════════════════════════════╝
```

---

## 6. Single-Mode Result Card (Updated)

Add provenance badge and optional nearby label to existing cards:

```jsx
// ResultCard.jsx additions:

{result.nearbyNote && (
  <p className={`text-xs mt-0.5 ${result.nearbyDistKm > 50 ? 'text-amber-300' : 'text-slate-400'}`}>
    📍 {result.nearbyNote}
  </p>
)}

<span className={`text-[11px] px-2 py-0.5 rounded-full border ${provenanceBadgeClass(result.provenance)}`}>
  {provenanceBadgeLabel(result.provenance)}
</span>
```

---

## 7. Provider-Unconfigured Empty State

When a mode returns `mode: 'provider-unconfigured'`:

```
┌─────────────────────────────────┐
│ 🚌 Bus Search                   │
│                                 │
│ Bus provider not configured.    │
│ Results will appear here once   │
│ a bus API is connected.         │
│                                 │
│ [Try Train ↗] [Try Flight ↗]   │
└─────────────────────────────────┘
```

- Background: `slate-900`
- Icon: mode-specific emoji (🚌 🚂 ✈️)
- NO spinner — immediately show empty state, not a loading skeleton

---

## 8. Component List (for Agent 02 — Frontend)

| Component | File | Priority |
|-----------|------|----------|
| `ProvenanceBadge` | `src/components/ProvenanceBadge.jsx` | P0 |
| `NearbyNodeLabel` | `src/components/NearbyNodeLabel.jsx` | P0 |
| `TransferRiskBadge` | `src/components/TransferRiskBadge.jsx` | P0 |
| `CombinationRouteCard` | `src/components/CombinationRouteCard.jsx` | P1 |
| `ProviderEmptyState` | `src/components/ProviderEmptyState.jsx` | P1 |
| Update `ResultCard` | `src/components/ResultCard.jsx` | P0 |

---

## 9. Accessibility Requirements

- All badges must have `aria-label` matching their text content
- Risk badges must NOT rely on colour alone — icon + text required
- `nearbyNote` must be in a `<p>` with `role="note"` for screen readers
- Combination cards: each leg section must have `aria-labelledby` pointing to mode heading

---

## 10. Dark Mode

All tokens above are dark-mode defaults (`bg-slate-900` base).
Light mode: invert badge backgrounds to `*-100`, text to `*-800`.
Use `dark:` prefix; default theme is dark.
