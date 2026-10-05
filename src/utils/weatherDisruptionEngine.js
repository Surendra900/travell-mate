/**
 * Open-Meteo Weather Disruption Engine for Indian Transit Junctions.
 * Free, no-key REST API integration monitoring fog, monsoon, and visibility disruptions.
 */

export const INDIAN_TRANSIT_COORDINATES = {
  Delhi: { lat: 28.6139, lon: 77.2090, state: 'Delhi', aliases: ['NDLS', 'DEL', 'New Delhi', 'Old Delhi', 'DLI', 'NZM'] },
  Mumbai: { lat: 19.0760, lon: 72.8777, state: 'Maharashtra', aliases: ['CSMT', 'BOM', 'Bombay', 'BCT', 'Dadar', 'LTT'] },
  Kolkata: { lat: 22.5726, lon: 88.3639, state: 'West Bengal', aliases: ['HWH', 'CCU', 'Howrah', 'Sealdah', 'SDAH'] },
  Chennai: { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', aliases: ['MAS', 'MAA', 'Madras', 'Chennai Central', 'MS'] },
  Bengaluru: { lat: 12.9716, lon: 77.5946, state: 'Karnataka', aliases: ['SBC', 'BLR', 'Bangalore', 'YPR', 'Yesvantpur'] },
  Hyderabad: { lat: 17.3850, lon: 78.4867, state: 'Telangana', aliases: ['SC', 'HYD', 'Secunderabad', 'Kacheguda'] },
  Jaipur: { lat: 26.9124, lon: 75.7873, state: 'Rajasthan', aliases: ['JP', 'JAI', 'Pink City'] },
  Nagpur: { lat: 21.1458, lon: 79.0882, state: 'Maharashtra', aliases: ['NGP', 'NAG', 'Diamond Crossing'] },
  Kanpur: { lat: 26.4499, lon: 80.3319, state: 'Uttar Pradesh', aliases: ['CNB', 'Kanpur Central'] },
  Lucknow: { lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh', aliases: ['LKO', 'Lucknow Charbagh'] },
  Patna: { lat: 25.5941, lon: 85.1376, state: 'Bihar', aliases: ['PNBE', 'PAT', 'Patna Junction'] },
  Prayagraj: { lat: 25.4358, lon: 81.8463, state: 'Uttar Pradesh', aliases: ['PRYJ', 'Allahabad', 'ALD'] },
  Varanasi: { lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh', aliases: ['BSB', 'VNS', 'Banaras', 'Kashi'] },
  Vijayawada: { lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh', aliases: ['BZA', 'VGA'] },
  Pune: { lat: 18.5204, lon: 73.8567, state: 'Maharashtra', aliases: ['PUNE', 'PNQ'] },
  Ahmedabad: { lat: 23.0225, lon: 72.5714, state: 'Gujarat', aliases: ['ADI', 'AMD', 'Sabarmati'] },
  Guwahati: { lat: 26.1445, lon: 91.7362, state: 'Assam', aliases: ['GHY', 'GAU', 'Northeast Gateway'] },
  Amritsar: { lat: 31.6340, lon: 74.8723, state: 'Punjab', aliases: ['ASR', 'ATQ'] }
};

export const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun', severity: 'CLEAR' },
  1: { label: 'Mainly Clear', icon: 'SunMedium', severity: 'CLEAR' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', severity: 'CLEAR' },
  3: { label: 'Overcast Skies', icon: 'Cloud', severity: 'ADVISORY' },
  45: { label: 'Dense Fog', icon: 'CloudFog', severity: 'CRITICAL' },
  48: { label: 'Depositing Rime Fog', icon: 'CloudFog', severity: 'CRITICAL' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', severity: 'ADVISORY' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', severity: 'ADVISORY' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', severity: 'WARNING' },
  61: { label: 'Slight Rain', icon: 'CloudRain', severity: 'ADVISORY' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', severity: 'WARNING' },
  65: { label: 'Heavy Torrential Rain', icon: 'CloudRainWind', severity: 'CRITICAL' },
  71: { label: 'Slight Snow', icon: 'Snowflake', severity: 'WARNING' },
  73: { label: 'Moderate Snow', icon: 'Snowflake', severity: 'CRITICAL' },
  75: { label: 'Heavy Snowfall', icon: 'Snowflake', severity: 'CRITICAL' },
  80: { label: 'Light Showers', icon: 'CloudRain', severity: 'ADVISORY' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRain', severity: 'WARNING' },
  82: { label: 'Violent Monsoon Downpour', icon: 'CloudRainWind', severity: 'CRITICAL' },
  95: { label: 'Severe Thunderstorm', icon: 'CloudLightning', severity: 'CRITICAL' },
  96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning', severity: 'CRITICAL' },
  99: { label: 'Severe Thunderstorm & Torrential Hail', icon: 'CloudLightning', severity: 'CRITICAL' }
};

export const DEMO_WEATHER_SCENARIOS = {
  delhi_dense_fog: {
    hub: 'Delhi',
    current: {
      time: '2026-10-05T06:00',
      temperature_2m: 8.5,
      relative_humidity_2m: 98,
      precipitation: 0.0,
      weather_code: 45,
      wind_speed_10m: 4.2,
      visibility: 250 // Dense northern winter fog
    }
  },
  mumbai_monsoon: {
    hub: 'Mumbai',
    current: {
      time: '2026-10-05T14:30',
      temperature_2m: 27.2,
      relative_humidity_2m: 95,
      precipitation: 26.5, // 26.5 mm/hr downpour
      weather_code: 65,
      wind_speed_10m: 48.0,
      visibility: 800
    }
  },
  chennai_cyclone: {
    hub: 'Chennai',
    current: {
      time: '2026-10-05T18:00',
      temperature_2m: 26.0,
      relative_humidity_2m: 94,
      precipitation: 38.0,
      weather_code: 99,
      wind_speed_10m: 72.0, // High winds
      visibility: 600
    }
  },
  bengaluru_clear: {
    hub: 'Bengaluru',
    current: {
      time: '2026-10-05T10:00',
      temperature_2m: 24.5,
      relative_humidity_2m: 55,
      precipitation: 0.0,
      weather_code: 0,
      wind_speed_10m: 12.0,
      visibility: 12500
    }
  }
};

/**
 * Match city or station code to canonical coordinates.
 */
export function resolveTransitCoordinates(query) {
  if (!query || typeof query !== 'string') return INDIAN_TRANSIT_COORDINATES.Delhi;

  const normalized = query.trim().toLowerCase();

  for (const [cityName, info] of Object.entries(INDIAN_TRANSIT_COORDINATES)) {
    if (cityName.toLowerCase() === normalized) {
      return { city: cityName, ...info };
    }
    if (info.aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return { city: cityName, ...info };
    }
  }

  // Substring search
  for (const [cityName, info] of Object.entries(INDIAN_TRANSIT_COORDINATES)) {
    if (normalized.includes(cityName.toLowerCase())) {
      return { city: cityName, ...info };
    }
    if (info.aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      return { city: cityName, ...info };
    }
  }

  return { city: query, ...INDIAN_TRANSIT_COORDINATES.Delhi };
}

/**
 * Evaluates transit delay risk based on Open-Meteo current meteorological values.
 */
export function evaluateTransitDisruption(currentWeather = {}, hubName = 'Transit Junction') {
  const code = currentWeather.weather_code ?? 0;
  const visibilityMeters = currentWeather.visibility ?? 10000;
  const precipitationMm = currentWeather.precipitation ?? 0;
  const windKmh = currentWeather.wind_speed_10m ?? 10;
  const tempC = currentWeather.temperature_2m ?? 25;

  const wmo = WMO_WEATHER_CODES[code] || { label: 'Fair Skies', severity: 'CLEAR' };

  let riskLevel = 'CLEAR';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
  let headline = `Normal Operations at ${hubName}`;
  let trainImpact = 'Normal signaling and speed limits across track blocks.';
  let flightImpact = 'Unrestricted visual flight and normal ILS approach.';
  let roadImpact = 'Clear driving conditions with regular highway flow.';
  let recommendedAction = 'Depart as scheduled. No weather-induced buffer necessary.';
  let delayEstimateMinutes = 0;

  // 1. Critical Fog (Codes 45, 48 or visibility < 500m)
  if (code === 45 || code === 48 || visibilityMeters < 500) {
    riskLevel = 'CRITICAL';
    badgeColor = 'bg-red-500/20 text-red-300 border-red-400/50';
    headline = `Dense Fog Emergency Alert for ${hubName}`;
    trainImpact = 'Indian Railways Fog Pass Device activated. Train speeds restricted to 60 km/h; Rajdhani & express services delayed +60m to +240m.';
    flightImpact = 'CAT-III instrument landing required at airport; departure ground stops and holding patterns probable.';
    roadImpact = 'Hazard lights recommended; highway visibility severely degraded below 200m.';
    recommendedAction = 'Keep minimum 90m connection buffer. Verify live tracking on NTES / RailMadad before heading to station.';
    delayEstimateMinutes = 120;
  }
  // 2. Heavy Torrential Rain / Monsoon (Codes 65, 82 or precipitation > 15mm/h)
  else if (code === 65 || code === 82 || precipitationMm >= 15) {
    riskLevel = 'CRITICAL';
    badgeColor = 'bg-red-500/20 text-red-300 border-red-400/50';
    headline = `Torrential Monsoon Alert for ${hubName}`;
    trainImpact = 'Risk of track waterlogging and speed cautions on low-lying rail lines. Suburban/express lines may face diversions or delays.';
    flightImpact = 'Crosswind gusts and reduced braking action on runways; possible taxiway delays.';
    roadImpact = 'Urban waterlogging hazard; inter-city bus routes delayed by traffic congestion.';
    recommendedAction = 'Allow extra 60m transfer buffer. Review alternative high-elevation express routes.';
    delayEstimateMinutes = 90;
  }
  // 3. Severe Thunderstorm or High Gale Winds (Codes 95, 96, 99 or wind > 60km/h)
  else if (code >= 95 || windKmh >= 60) {
    riskLevel = 'CRITICAL';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/50';
    headline = `Severe Thunderstorm & Wind Caution at ${hubName}`;
    trainImpact = 'Overhead Equipment (OHE) caution; potential tree falls causing brief power line trips.';
    flightImpact = 'Turbulence advisories and runway queue delays during squall peaks.';
    roadImpact = 'Reduced vehicle stability on highways; avoid elevated flyovers during peak gusts.';
    recommendedAction = 'Seek shelter inside the terminal/station building during active storm peak.';
    delayEstimateMinutes = 45;
  }
  // 4. Moderate Rain or Moderate Fog (Codes 55, 63, 81 or visibility < 1500m)
  else if (code === 63 || code === 55 || code === 81 || visibilityMeters < 1500) {
    riskLevel = 'WARNING';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/50';
    headline = `Moderate Weather Advisory for ${hubName}`;
    trainImpact = 'Wet rails and mild speed regulations (+15m to +35m potential delay).';
    flightImpact = 'Standard rain approaches; minor ramp congestion.';
    roadImpact = 'Wet pavement; allow 20% extra travel time for station transfers.';
    recommendedAction = 'Maintain at least a 30m buffer between connecting train or bus legs.';
    delayEstimateMinutes = 30;
  }
  // 5. Light Drizzle or Overcast Skies (Codes 3, 51, 53, 61, 80)
  else if (code === 3 || code === 51 || code === 53 || code === 61 || code === 80) {
    riskLevel = 'ADVISORY';
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-400/40';
    headline = `Passing Showers / Overcast at ${hubName}`;
    trainImpact = 'Negligible impact on train operations (+5m to +10m).';
    flightImpact = 'Normal operations.';
    roadImpact = 'Slightly slower auto/cab transit to the junction.';
    recommendedAction = 'Pack an umbrella or light raincoat for open platform transfers.';
    delayEstimateMinutes = 10;
  }

  return {
    hubName,
    weatherCode: code,
    weatherLabel: wmo.label,
    riskLevel,
    badgeColor,
    headline,
    delayEstimateMinutes,
    temperatureC: tempC,
    visibilityKm: (visibilityMeters / 1000).toFixed(1),
    precipitationMm,
    windSpeedKmh: windKmh,
    trainImpact,
    flightImpact,
    roadImpact,
    recommendedAction,
    isDisrupted: riskLevel === 'CRITICAL' || riskLevel === 'WARNING'
  };
}

/**
 * Fetch live current weather from Open-Meteo REST API with timeout and fallback cache.
 */
export async function fetchHubWeatherDisruption(hubQuery, { scenario = null, timeoutMs = 7000 } = {}) {
  // If demo scenario requested (e.g. for testing winter fog or monsoon demo)
  if (scenario && DEMO_WEATHER_SCENARIOS[scenario]) {
    const mock = DEMO_WEATHER_SCENARIOS[scenario];
    return {
      ok: true,
      source: 'scenario-simulator',
      hub: mock.hub,
      current: mock.current,
      analysis: evaluateTransitDisruption(mock.current, mock.hub)
    };
  }

  const coords = resolveTransitCoordinates(hubQuery);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,visibility`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};

    return {
      ok: true,
      source: 'open-meteo-live',
      hub: coords.city,
      coordinates: { lat: coords.lat, lon: coords.lon },
      current,
      analysis: evaluateTransitDisruption(current, coords.city)
    };
  } catch (err) {
    // Graceful offline fallback
    const fallbackCurrent = {
      time: new Date().toISOString(),
      temperature_2m: 28.0,
      relative_humidity_2m: 60,
      precipitation: 0,
      weather_code: 0,
      wind_speed_10m: 10.0,
      visibility: 10000
    };

    return {
      ok: false,
      source: 'offline-cached-model',
      hub: coords.city || hubQuery,
      current: fallbackCurrent,
      analysis: evaluateTransitDisruption(fallbackCurrent, coords.city || hubQuery),
      error: err.message
    };
  }
}
