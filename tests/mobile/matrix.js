/**
 * Mobile Device Matrix and Route Catalog for TravelMate
 */

export const DEVICE_MATRIX = [
  { id: 'mobile-320', name: 'Small Phone (WCAG Reflow)', width: 320, height: 640, isMobile: true, hasTouch: true },
  { id: 'mobile-360', name: 'Common Android (360x740)', width: 360, height: 740, isMobile: true, hasTouch: true },
  { id: 'mobile-375', name: 'iPhone SE Class (375x667)', width: 375, height: 667, isMobile: true, hasTouch: true },
  { id: 'mobile-390', name: 'iPhone 13/14 Class (390x844)', width: 390, height: 844, isMobile: true, hasTouch: true },
  { id: 'mobile-393', name: 'Pixel Class (393x851)', width: 393, height: 851, isMobile: true, hasTouch: true },
  { id: 'mobile-412', name: 'Galaxy Class (412x915)', width: 412, height: 915, isMobile: true, hasTouch: true },
  { id: 'mobile-430', name: 'Large iPhone Class (430x932)', width: 430, height: 932, isMobile: true, hasTouch: true },
  { id: 'landscape-740', name: 'Android Landscape (740x360)', width: 740, height: 360, isMobile: true, hasTouch: true },
  { id: 'landscape-844', name: 'iPhone Landscape (844x390)', width: 844, height: 390, isMobile: true, hasTouch: true },
  { id: 'tablet-768', name: 'iPad Portrait (768x1024)', width: 768, height: 1024, isMobile: false, hasTouch: true },
  { id: 'tablet-1024', name: 'iPad Landscape (1024x768)', width: 1024, height: 768, isMobile: false, hasTouch: true },
  { id: 'desktop-1280', name: 'Desktop Baseline (1280x800)', width: 1280, height: 800, isMobile: false, hasTouch: false },
  { id: 'desktop-1440', name: 'Desktop Large (1440x900)', width: 1440, height: 900, isMobile: false, hasTouch: false }
]

export const ROUTE_STATES = [
  { id: 'home', path: '/', name: 'Home' },
  { id: 'home-nav-open', path: '/', name: 'Home (Mobile Menu Open)', action: 'openNav' },
  { id: 'home-voice-open', path: '/', name: 'Home (Voice Dialog Open)', action: 'openVoice' },
  { id: 'planner', path: '/planner', name: 'Planner (Empty)' },
  { id: 'planner-results', path: '/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-20&transportMode=Train&demo=true', name: 'Planner (Recovery Results)' },
  { id: 'tatkal', path: '/planner?mode=tatkal&from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-20', name: 'Tatkal Desk' },
  { id: 'safety', path: '/safety', name: 'Passes and Safety Hub' },
  { id: 'safety-sos', path: '/safety', name: 'Safety SOS Tab', action: 'openSosTab' },
  { id: 'safety-detail', path: '/safety/medical', name: 'Safety Detail (Medical)' },
  { id: 'saved', path: '/saved', name: 'Saved Plans' },
  { id: 'analyze', path: '/analyze', name: 'Analyze Journey' },
  { id: 'privacy', path: '/privacy', name: 'Privacy Policy' },
  { id: 'terms', path: '/terms', name: 'Terms of Service' },
  { id: 'disclaimer', path: '/disclaimer', name: 'Legal Disclaimer' },
  { id: 'cookies', path: '/cookies', name: 'Cookie Policy' },
  { id: 'notfound', path: '/non-existent-route-404', name: '404 Page' }
]
