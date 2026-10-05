export const TOUR_STEPS = [
  {
    step: 1,
    title: 'Multimodal Split-Routing Engine',
    kicker: 'AI FOR BHARAT & PUBLIC INFRASTRUCTURE',
    badge: 'National Innovation #1',
    iconKey: 'route',
    iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    summary:
      'Solves the Indian Railways waitlist crisis by autonomously discovering split-transit itineraries (Train + Bus, Train + Flight) across 3 ranked tiers: Paisa Vasool (Budget), Smart Balanced, and Emergency Express.',
    highlights: [
      'Station Hopper alternate GN quota bypass algorithm',
      'Pre-filled official deep links to IRCTC, RedBus, and Google Flights',
      'Zero fake bookings · 100% legal passenger ticket assistance'
    ],
    targetRoute: '/planner',
    actionText: 'Explore Multimodal Planner'
  },
  {
    step: 2,
    title: 'Divyangjan Voice Accessibility Mode',
    kicker: 'ACCESSIBLE PUBLIC SERVICES & INCLUSION',
    badge: 'National Innovation #2',
    iconKey: 'volume-2',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    summary:
      'Empowers visually impaired and blind travelers across Bharat through a full-screen spoken onboarding gate ("Are you blind?"), phonetic Indian city alias resolution, and hands-free spoken route summaries.',
    highlights: [
      'Instant Alt+B keyboard shortcut for instant hands-free activation',
      'Agentic tool-use: speaks route options and filters by voice',
      'Tested against axe-core WCAG 2.1 AA accessibility guidelines'
    ],
    targetRoute: '/planner',
    actionText: 'Test Voice Accessibility'
  },
  {
    step: 3,
    title: 'AES-256 Encrypted Vault & DPDP Compliance',
    kicker: 'CITIZEN PRIVACY & DIGITAL GOVERNANCE',
    badge: 'National Innovation #3',
    iconKey: 'lock',
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    summary:
      'Zero-server client-side security architecture powered by Web Crypto API AES-GCM 256-bit encryption with PBKDF2 (310k iterations). Fully aligned with India\'s Digital Personal Data Protection (DPDP) Act 2023.',
    highlights: [
      'Encrypted offline Boarding Pass generation with Quick-PIN unlock',
      'Zero credential transmission to remote backends',
      'Granular consent management & 1-tap statutory Right to Erasure'
    ],
    targetRoute: '/saved',
    actionText: 'Open Encrypted Vault'
  },
  {
    step: 4,
    title: 'Open-Meteo Winter Fog & Disruption Engine',
    kicker: 'CLIMATE RESILIENCE & JUNCTION INTELLIGENCE',
    badge: 'National Innovation #4',
    iconKey: 'cloud-fog',
    iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    summary:
      'Real-time meteorological monitoring of winter fog (<500m visibility) and torrential monsoon waterlogging across 18+ trunk Indian railway and airport junctions via unauthenticated Open-Meteo REST API.',
    highlights: [
      'Indian Railways Fog Pass device notices and speed restriction alerts',
      'Airport CAT-III instrument landing warnings and delay estimates',
      'Interactive transit stress scenario simulators (Delhi fog, Mumbai rain)'
    ],
    targetRoute: '/planner',
    actionText: 'View Weather Disruption Monitor'
  },
  {
    step: 5,
    title: '1-Tap SOS Telemetry & Contingency Engine',
    kicker: 'HEALTH TECH, SAFETY & CRISIS PROTOCOLS',
    badge: 'National Innovation #5',
    iconKey: 'shield-alert',
    iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    summary:
      'Mission-critical traveler safety with single-tap emergency dialing (112, 139, 108, 1090), automated device GPS coordinate telemetry, and autonomous connecting contingency re-routing when delays exceed 45 minutes.',
    highlights: [
      'Pre-formatted WhatsApp/SMS crisis dispatch with live coordinates',
      'Zero-signal offline incident protocol action cards',
      '1-tap contingency activation for severe junction delays'
    ],
    targetRoute: '/safety',
    actionText: 'Explore Emergency Toolkit'
  }
];
