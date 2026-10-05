import { useState, useEffect } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  Sun,
  Wind,
  Eye,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  TrainFront,
  Plane,
  BusFront,
  Clock
} from 'lucide-react';
import {
  fetchHubWeatherDisruption,
  resolveTransitCoordinates
} from '../utils/weatherDisruptionEngine';

export default function WeatherDisruptionAlert({ plan = {}, compact = false }) {
  const [selectedHub, setSelectedHub] = useState('Delhi');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulatedScenario, setSimulatedScenario] = useState(null);

  // Auto-detect hub based on plan from/to
  useEffect(() => {
    const hubFromPlan = plan.from || plan.to || 'Delhi';
    const resolved = resolveTransitCoordinates(hubFromPlan);
    setSelectedHub(resolved.city);
  }, [plan.from, plan.to]);

  // Load weather when selected hub or scenario changes
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setLoading(true);
      const res = await fetchHubWeatherDisruption(selectedHub, {
        scenario: simulatedScenario
      });
      if (isMounted) {
        setWeatherData(res);
        setLoading(false);
      }
    }
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [selectedHub, simulatedScenario]);

  const analysis = weatherData?.analysis;
  const current = weatherData?.current;

  // Icon selector based on weather code
  function getWeatherIcon(code) {
    if (code === 45 || code === 48) return <CloudFog className="h-6 w-6 text-amber-400" />;
    if (code === 65 || code === 82) return <CloudRainWind className="h-6 w-6 text-blue-400" />;
    if (code >= 95) return <CloudLightning className="h-6 w-6 text-yellow-400" />;
    if (code >= 51 && code <= 81) return <CloudRain className="h-6 w-6 text-cyan-400" />;
    if (code === 3) return <Cloud className="h-6 w-6 text-slate-400" />;
    return <Sun className="h-6 w-6 text-amber-300" />;
  }

  return (
    <section
      className="rounded-3xl border border-slate-700/60 bg-slate-900 p-5 shadow-2xl transition-all sm:p-6 text-slate-100"
      data-testid="weather-disruption-alert"
      aria-label="Transit Weather Disruption Monitor"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-300">
            {getWeatherIcon(analysis?.weatherCode)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Live Transit Junction Weather
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                Open-Meteo REST API
              </span>
            </div>
            <h3 className="text-lg font-black text-white sm:text-xl">
              {analysis?.headline || `Weather Advisory: ${selectedHub}`}
            </h3>
          </div>
        </div>

        {/* Severity Badge */}
        <div className="flex items-center gap-2">
          {analysis && (
            <span
              data-testid="weather-risk-badge"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${analysis.badgeColor}`}
            >
              {analysis.riskLevel === 'CRITICAL' ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : analysis.riskLevel === 'WARNING' ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {analysis.riskLevel} DISRUPTION RISK
            </span>
          )}
          <button
            onClick={() => {
              setSimulatedScenario(null);
              setLoading(true);
              fetchHubWeatherDisruption(selectedHub).then((res) => {
                setWeatherData(res);
                setLoading(false);
              });
            }}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white"
            title="Refresh Live Junction Weather"
            aria-label="Refresh Live Junction Weather"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulator Scenario Bar (for judge demos and severe condition simulations) */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-bold text-slate-200">Transit Stress Scenarios:</span>
        <button
          type="button"
          data-testid="sim-fog-btn"
          onClick={() => {
            setSelectedHub('Delhi');
            setSimulatedScenario('delhi_dense_fog');
          }}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
            simulatedScenario === 'delhi_dense_fog'
              ? 'border border-red-500/60 bg-red-950 text-red-200'
              : 'border border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          🌫️ Delhi Winter Fog (&lt;250m)
        </button>
        <button
          type="button"
          data-testid="sim-monsoon-btn"
          onClick={() => {
            setSelectedHub('Mumbai');
            setSimulatedScenario('mumbai_monsoon');
          }}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
            simulatedScenario === 'mumbai_monsoon'
              ? 'border border-blue-500/60 bg-blue-950 text-blue-200'
              : 'border border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          🌧️ Mumbai Monsoon (26mm/h)
        </button>
        <button
          type="button"
          data-testid="sim-cyclone-btn"
          onClick={() => {
            setSelectedHub('Chennai');
            setSimulatedScenario('chennai_cyclone');
          }}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
            simulatedScenario === 'chennai_cyclone'
              ? 'border border-amber-500/60 bg-amber-950 text-amber-200'
              : 'border border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          🌀 Cyclone Gale (72 km/h)
        </button>
        <button
          type="button"
          data-testid="sim-live-btn"
          onClick={() => setSimulatedScenario(null)}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
            simulatedScenario === null
              ? 'border border-emerald-500/60 bg-emerald-950 text-emerald-200'
              : 'border border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          📡 Real-Time Open-Meteo
        </button>
      </div>

      {/* Meteorological Telemetry Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Thermometer className="h-3.5 w-3.5 text-orange-400" />
            <span>Temperature</span>
          </div>
          <p className="mt-1 text-base font-extrabold text-white">
            {current?.temperature_2m !== undefined ? `${current.temperature_2m}°C` : '--'}
          </p>
          <span className="text-[10px] text-slate-300">{analysis?.weatherLabel || 'Fair'}</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Visibility</span>
          </div>
          <p
            className={`mt-1 text-base font-extrabold ${
              Number(analysis?.visibilityKm) < 1.0 ? 'text-red-400' : 'text-white'
            }`}
            data-testid="weather-visibility-val"
          >
            {analysis?.visibilityKm !== undefined ? `${analysis.visibilityKm} km` : '--'}
          </p>
          <span className="text-[10px] text-slate-300">
            {Number(analysis?.visibilityKm) < 0.5
              ? 'Dense fog hazard'
              : Number(analysis?.visibilityKm) < 2.0
              ? 'Reduced visibility'
              : 'Clear visual'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <CloudRain className="h-3.5 w-3.5 text-blue-400" />
            <span>Precipitation</span>
          </div>
          <p className="mt-1 text-base font-extrabold text-white">
            {current?.precipitation !== undefined ? `${current.precipitation} mm/h` : '0 mm/h'}
          </p>
          <span className="text-[10px] text-slate-300">
            {Number(current?.precipitation) > 10 ? 'High waterlogging' : 'Normal drainage'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Wind className="h-3.5 w-3.5 text-indigo-400" />
            <span>Wind Velocity</span>
          </div>
          <p className="mt-1 text-base font-extrabold text-white">
            {current?.wind_speed_10m !== undefined ? `${current.wind_speed_10m} km/h` : '--'}
          </p>
          <span className="text-[10px] text-slate-300">
            {Number(current?.wind_speed_10m) > 50 ? 'Gale cautions' : 'Light breeze'}
          </span>
        </div>
      </div>

      {/* Multimodal Transit Impact Breakdown */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <TrainFront className="h-4 w-4" />
            <span>Rail Impact</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {analysis?.trainImpact}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
            <Plane className="h-4 w-4" />
            <span>Aviation Impact</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {analysis?.flightImpact}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <BusFront className="h-4 w-4" />
            <span>Road & Bus Impact</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {analysis?.roadImpact}
          </p>
        </div>
      </div>

      {/* Actionable Advice & Estimated Delay Banner */}
      <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/40 p-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <Clock className="h-4 w-4" />
            <span>Recommended Traveler Action:</span>
          </div>
          <p className="text-xs text-slate-200" data-testid="weather-recommended-action">
            {analysis?.recommendedAction}
          </p>
        </div>

        {analysis?.delayEstimateMinutes > 0 && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-300">
            <span>Weather Delay Risk:</span>
            <span className="text-sm text-amber-200">+{analysis.delayEstimateMinutes}m</span>
          </div>
        )}
      </div>
    </section>
  );
}
