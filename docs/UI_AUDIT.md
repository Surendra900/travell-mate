# TravelMate AI — UI Audit
# Agent 29: Visual QA Tester | Completed: 2026-11-25

> Based on: screenshot analysis, source code review of all pages and components.
> Screenshot attached by user shows the "Local device profile" modal on the Planner page.

---

## Screenshot Analysis (User-Provided)

The screenshot shows a **white modal on a dark background** with:
- ❌ Modal has no branded header — just bare "Local device profile" button text
- ❌ Inputs have no visible label alignment (mismatched 2-column grid breaks on content)
- ❌ "Close" button is a plain `<button>` with no styling — looks like a browser default
- ❌ Yellow information box has no icon, poor contrast, looks like a warning box with no purpose
- ❌ "Save local profile" CTA button is correct width but generic blue — no brand connection
- ❌ Background is blurred dark content but the modal itself is pure white — jarring contrast
- ❌ No TravelMate brand identity anywhere in the modal

---

## Page-by-Page Audit

### 1. Home Page (`/`)
| Issue | Severity |
|-------|----------|
| Mode selector pills (Train/Bus/Flight/Combination) lack clear selected/unselected visual distinction | HIGH |
| Hero section text hierarchy not clear — multiple competing headings at same visual weight | HIGH |
| Popular corridors cards have no hover animation or depth | MEDIUM |
| CTA buttons mix styles across the page (some sky-700, some teal-800) | HIGH |
| Search form on mobile likely overflows or stacks awkwardly | HIGH |
| "Travel Tonight" toggle has no accessible label visible | MEDIUM |
| PNR modal trigger is a small text link — hard to find | LOW |
| NLP input box styling inconsistent with other inputs | MEDIUM |

### 2. Planner Page (`/planner`)
| Issue | Severity |
|-------|----------|
| Three separate planner modes (Normal/Emergency/LowNetwork) have no clear visual switching | HIGH |
| LiveResultsPanel result cards use `bg-white` with heavy border — looks dated | HIGH |
| `SourceBadge` component duplicates `ProvenanceBadge` — two badge systems shown simultaneously | HIGH |
| Filter sidebar (if any) not styled consistently with main content | MEDIUM |
| Loading states not visible / no skeleton screens | HIGH |
| Result sort/filter controls buried or absent visually | HIGH |
| "Book on IRCTC ↗" links styled as plain underlined text — no button affordance | MEDIUM |
| NearbyNodeLabel added but ResultCard still uses white `bg-white rounded-2xl border border-slate-200` — clashes with dark badge | HIGH |

### 3. Navbar
| Issue | Severity |
|-------|----------|
| Nav links have no clear active state indicator beyond text colour | MEDIUM |
| Mobile hamburger menu opens but has no slide animation | LOW |
| Language selector dropdown has no keyboard focus ring | HIGH |
| Logo area has no wordmark — just icon + text, no brand distinction | MEDIUM |
| AccountMenu button not visually differentiated from nav links | MEDIUM |

### 4. Local Device Profile Modal
| Issue | Severity |
|-------|----------|
| No brand header / logo | HIGH |
| "Close" button is unstyled browser default | HIGH |
| Yellow info box has no icon and poor contrast | HIGH |
| Modal backdrop not dark enough — content bleeds through | MEDIUM |
| Form fields have no focus ring styling | HIGH |
| 2-column grid breaks on inputs < 768px | HIGH |

### 5. Safety Mode Page (`/safety`)
| Issue | Severity |
|-------|----------|
| Emergency SOS section uses red inconsistently | MEDIUM |
| Offline Pass cards not visually distinct from regular content | MEDIUM |

### 6. Saved Plans Page (`/saved`)
| Issue | Severity |
|-------|----------|
| Empty state has no illustration or clear call-to-action | HIGH |
| Delete button (Trash2 icon) has no confirmation UI | MEDIUM |
| Plan cards use inconsistent spacing vs. result cards | MEDIUM |

### 7. Legal Pages (`/privacy`, `/terms`, `/disclaimer`, `/cookies`)
| Issue | Severity |
|-------|----------|
| Plain prose with no visual hierarchy (headers all same size) | MEDIUM |
| No table of contents or sticky nav | LOW |

### 8. Footer
| Issue | Severity |
|-------|----------|
| Footer is functional but dense — 4 columns on mobile stacks poorly | MEDIUM |
| Links have no hover underline animation | LOW |

### 9. 404 Page
| Issue | Severity |
|-------|----------|
| Likely unstyled or minimal — not checked | MEDIUM |

### 10. Global / Cross-Cutting
| Issue | Severity |
|-------|----------|
| **Mixed design systems**: CSS custom properties (`--tm-primary`) defined in `index.css` but Tailwind classes used in JSX — not unified | HIGH |
| **No consistent focus ring** across interactive elements | HIGH |
| **Dark mode**: CSS has `color-scheme: light` only — no dark mode support despite dark-coloured navbar/footer | HIGH |
| **Font stack**: falls back to system fonts — no Google Font or brand typeface loaded | MEDIUM |
| **Tailwind config** has no brand colour extensions — all colours hardcoded per-component | HIGH |
| **No loading skeletons** — results appear from blank | HIGH |
| **Toast / notification system**: exists but style inconsistent | MEDIUM |
| **Card shadows**: minimal `shadow-sm` only — lacks depth | LOW |

---

## Priority Fix Order

1. 🔴 **P0**: Design tokens in Tailwind config (colours, radii, spacing)
2. 🔴 **P0**: Planner result cards — unified ProvenanceBadge, remove duplicate SourceBadge
3. 🔴 **P0**: Mode selector — clear active state
4. 🔴 **P0**: Local Device Profile modal — brand it, fix inputs, fix Close button
5. 🟡 **P1**: Loading skeletons on all data-fetching pages
6. 🟡 **P1**: Navbar active states, focus rings, mobile menu
7. 🟡 **P1**: Empty + error states on all pages
8. 🟢 **P2**: Legal pages hierarchy
9. 🟢 **P2**: Footer mobile stacking
