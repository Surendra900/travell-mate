import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map,
  MapPinOff,
  Navigation,
  WifiOff,
  Maximize2,
  GitCommit,
  TrainFront,
  Plane,
  BusFront,
  Layers
} from 'lucide-react';
import { findTransportPlace, routeCombos } from '../data/transportData';
import { getTransitHubGuide, transitHubDirectory } from '../data/transitHubData';

const segmentColors = {
  Train: '#22d3ee', // Cyan
  Flight: '#f97316', // Orange
  Bus: '#a3e635' // Lime
};

import { escapeHtml } from '../utils/sanitize.js';
export { escapeHtml };

function midpoint(a, b, offset = 0) {
  return [(a[0] + b[0]) / 2 + offset, (a[1] + b[1]) / 2 + offset];
}

function resolveHubDetails(cityName) {
  if (!cityName) return null;
  for (const [key, hub] of Object.entries(transitHubDirectory)) {
    if (key.toLowerCase() === cityName.toLowerCase() || cityName.toLowerCase().includes(key.toLowerCase())) {
      return hub;
    }
  }
  return null;
}

function pathForPlan(plan) {
  const from = findTransportPlace(plan.from || 'Delhi');
  const to = findTransportPlace(plan.to || 'Mumbai');
  if (!from || !to || from.city === to.city) {
    // Default fallback to trunk route Delhi -> Mumbai
    const defaultFrom = findTransportPlace('Delhi');
    const defaultTo = findTransportPlace('Mumbai');
    return {
      combo: routeCombos[0],
      points: [[defaultFrom.lat, defaultFrom.lng], [defaultTo.lat, defaultTo.lng]],
      labels: [defaultFrom.city, defaultTo.city],
      places: [defaultFrom, defaultTo],
      junctionHub: null
    };
  }

  const combo =
    routeCombos.find((item) => item.label === plan.routeCombo) ||
    routeCombos.find((item) => item.label === `${plan.transportMode || 'Train'} only`) ||
    routeCombos[0];

  const start = [from.lat, from.lng];
  const end = [to.lat, to.lng];

  if (combo.sequence.length === 1) {
    return {
      combo,
      points: [start, end],
      labels: [from.city, to.city],
      places: [from, to],
      junctionHub: null
    };
  }

  // Multimodal route with intermediate transfer hub
  // Check if intermediate hub is near Nagpur, Jaipur, Vijayawada, etc.
  let junctionCity = 'Nagpur';
  if ((from.city === 'Delhi' || to.city === 'Delhi') && (from.city === 'Mumbai' || to.city === 'Mumbai')) {
    junctionCity = 'Jaipur';
  } else if (from.city.includes('Bengaluru') || to.city.includes('Bengaluru') || from.city.includes('Chennai')) {
    junctionCity = 'Vijayawada';
  }

  const junctionPlace = findTransportPlace(junctionCity) || {
    city: junctionCity,
    lat: midpoint(start, end, 1.2)[0],
    lng: midpoint(start, end, 1.2)[1],
    station: `${junctionCity} Junction`
  };

  const stop = [junctionPlace.lat, junctionPlace.lng];
  const junctionHub = resolveHubDetails(junctionCity) || getTransitHubGuide({ junctionCity });

  return {
    combo,
    points: [start, stop, end],
    labels: [from.city, `${junctionCity} Junction Transfer`, to.city],
    places: [from, junctionPlace, to],
    junctionCity,
    junctionHub
  };
}

export default function RouteMap({ plan = {} }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [selectedJunctionInfo, setSelectedJunctionInfo] = useState(null);

  const route = useMemo(() => pathForPlan(plan), [plan.from, plan.to, plan.routeCombo, plan.transportMode]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!online || !route || !mapContainerRef.current) return undefined;

    // Destroy prior map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false
    }).setView([22.5, 78.9], 5);

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    const latLngs = route.points.map(([lat, lng]) => L.latLng(lat, lng));

    // Markers
    route.points.forEach(([lat, lng], index) => {
      const isStart = index === 0;
      const isEnd = index === route.points.length - 1;
      const isJunction = !isStart && !isEnd;

      const place = route.places[index];
      const markerColor = isStart ? '#22d3ee' : isEnd ? '#10b981' : '#f59e0b';
      const markerRadius = isJunction ? 10 : 8;

      const marker = L.circleMarker([lat, lng], {
        radius: markerRadius,
        color: '#ffffff',
        weight: 2.5,
        fillColor: markerColor,
        fillOpacity: 1
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'text-xs text-slate-900 font-sans p-1 max-w-[200px]';
      popupContent.innerHTML = `
        <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
          ${escapeHtml(route.labels[index])}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
          ${escapeHtml(place?.station || place?.city || 'Transit Node')}
        </div>
        ${
          isJunction && route.junctionHub
            ? `
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 4px 6px; font-size: 10px; color: #92400e; margin-top: 4px;">
            <b>Transfer Hub Tip:</b> ${escapeHtml(route.junctionHub.trainTransferTip || 'Direct platform ramp access.')}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Bus terminal: ${escapeHtml(route.junctionHub.busTerminalDistanceKm || '2')} km (Auto: ${escapeHtml(route.junctionHub.busAutoFare || '₹50-₹80')})
          </div>
        `
            : ''
        }
      `;

      marker.bindPopup(popupContent);
      marker.bindTooltip(escapeHtml(route.labels[index]), {
        permanent: false,
        direction: 'top',
        className: 'rounded px-2 py-0.5 text-xs font-bold'
      });

      if (isJunction) {
        marker.on('click', () => {
          setSelectedJunctionInfo(route.junctionHub);
        });
      }

      marker.addTo(layer);
    });

    // Draw route polylines
    route.combo.sequence.forEach((mode, index) => {
      if (index >= latLngs.length - 1) return;
      const fromPoint = latLngs[index];
      const toPoint = latLngs[index + 1];

      L.polyline([fromPoint, toPoint], {
        color: segmentColors[mode] || '#22d3ee',
        weight: 4.5,
        opacity: 0.9,
        dashArray: mode === 'Flight' ? '8 8' : mode === 'Bus' ? '4 6' : undefined
      }).addTo(layer);
    });

    // Fit map bounds
    map.fitBounds(L.latLngBounds(latLngs).pad(0.35), { animate: false });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [online, route]);

  function handleZoomFit() {
    if (!mapInstanceRef.current || !route) return;
    const latLngs = route.points.map(([lat, lng]) => L.latLng(lat, lng));
    mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs).pad(0.35));
  }

  function handleFocusJunction() {
    if (!mapInstanceRef.current || !route || route.points.length < 3) return;
    const junctionPoint = route.points[1];
    mapInstanceRef.current.setView([junctionPoint[0], junctionPoint[1]], 9, { animate: true });
    if (route.junctionHub) {
      setSelectedJunctionInfo(route.junctionHub);
    }
  }

  return (
    <section
      className="rounded-3xl border border-slate-700/60 bg-slate-900 p-5 shadow-2xl transition-all sm:p-6 text-slate-100"
      data-testid="interactive-route-map"
      aria-label="Interactive Route Map"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Interactive Route Map
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
              Leaflet &middot; OpenStreetMap
            </span>
          </div>
          <h3 className="text-xl font-black text-white sm:text-2xl">
            {route ? `${route.labels[0]} \u2192 ${route.labels.at(-1)}` : 'India Transit Corridor Visualizer'}
          </h3>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="map-zoom-fit"
            onClick={handleZoomFit}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white"
            title="Zoom to Fit Full Route"
          >
            <Maximize2 size={13} />
            <span>Fit Route</span>
          </button>
          {route?.points.length > 2 && (
            <button
              type="button"
              data-testid="map-focus-junction"
              onClick={handleFocusJunction}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
              title="Focus on Intermediate Junction"
            >
              <GitCommit size={13} />
              <span>Junction Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas / Offline state */}
      {!route ? (
        <div className="grid h-[280px] place-items-center rounded-2xl border border-yellow-400/20 bg-slate-950 p-6 text-center text-yellow-100">
          <div>
            <MapPinOff className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
            <b className="text-base">Select two supported transit cities to view route map.</b>
            <p className="mt-1 text-xs text-slate-400">
              TravelMate renders verified transit lines across Indian rail, air, and road trunk networks.
            </p>
          </div>
        </div>
      ) : online ? (
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="h-[340px] w-full overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950 shadow-inner"
            aria-label="Interactive Leaflet route map"
            data-testid="leaflet-map-canvas"
          />

          {/* Quick Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap gap-1.5 rounded-xl border border-slate-800/90 bg-slate-950/85 p-2 backdrop-blur-md">
            <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Train Line
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" /> Flight Path
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-lime-400">
              <span className="h-2 w-2 rounded-full bg-lime-400" /> Bus / Highway
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" /> Junction Transfer
            </span>
          </div>
        </div>
      ) : (
        <div className="grid h-[280px] place-items-center rounded-2xl border border-yellow-400/20 bg-slate-950 p-6 text-center text-yellow-100">
          <div>
            <WifiOff className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
            <b className="text-base">Map tiles require network access.</b>
            <p className="mt-1 text-xs text-slate-400">
              Your offline itinerary snapshot and timetable remain accessible without signal.
            </p>
          </div>
        </div>
      )}

      {/* Junction Guidance Highlight Card if present */}
      {route?.junctionHub && (
        <div
          data-testid="map-junction-card"
          className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-100"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-xs font-black text-amber-300">
                TRANSIT HUB
              </span>
              <h4 className="font-extrabold text-white text-sm sm:text-base">
                {route.junctionHub.stationName || `${route.junctionCity} Junction`}
              </h4>
            </div>
            <span className="text-xs text-amber-300 font-semibold">
              Safety Score: {route.junctionHub.safetyScore || 98}/100 &middot; {route.junctionHub.platforms || 8} Platforms
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-200/90 leading-relaxed">
            {route.junctionHub.trainTransferTip}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
            <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">
              Terminal: {route.junctionHub.busTerminalName} ({route.junctionHub.busTerminalDistanceKm} km)
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">
              Auto Fare: {route.junctionHub.busAutoFare}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">
              Airport: {route.junctionHub.airportDistanceKm} km ({route.junctionHub.airportTaxiFare})
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
