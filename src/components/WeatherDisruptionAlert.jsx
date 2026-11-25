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

  useEffect(() => {
    const hubFromPlan = plan.from || plan.to || 'Delhi';
    const resolved = resolveTransitCoordinates(hubFromPlan);
    setSelectedHub(resolved.city);
  }, [plan.from, plan.to]);

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

  function getWeatherIcon(code) {
    if (code === 45 || code === 48) return <CloudFog className="h-5 w-5 text-amber-600" />;
    if (code === 65 || code === 82) return <CloudRainWind className="h-5 w-5 text-blue-600" />;
    if (code >= 95) return <CloudLightning className="h-5 w-5 text-amber-700" />;
    if (code >= 51 && code <= 81) return <CloudRain className="h-5 w-5 text-blue-500" />;
    if (code === 3) return <Cloud className="h-5 w-5 text-gray-400" />;
    return <Sun className="h-5 w-5 text-amber-500" />;
  }

  const borderLeftColor = analysis?.riskLevel === 'CRITICAL' ? 'border-l-red-600' : analysis?.riskLevel === 'WARNING' ? 'border-l-amber-600' : 'border-l-[#15803D]';

  return (
    <section
      className={`rounded-md border border-gray-200 border-l-4 ${borderLeftColor} bg-white p-4 sm:p-5 shadow-xs text-gray-900`}
      data-testid="weather-disruption-alert"
      aria-label="Transit Weather Disruption Monitor"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded border border-gray-200 bg-gray-50 p-2 text-gray-700 shrink-0">
            {getWeatherIcon(analysis?.weatherCode)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Live Transit Junction Weather
              </span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 border border-gray-200 font-mono">
                Open-Meteo REST API
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 sm:text-base mt-0.5">
              {analysis?.headline || `Weather Advisory: ${selectedHub}`}
            </h3>
          </div>
        </div>

        {/* Severity Badge */}
        <div className="flex items-center gap-2">
          {analysis && (
            <span
              data-testid="weather-risk-badge"
              className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                analysis.riskLevel === 'CRITICAL'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : analysis.riskLevel === 'WARNING'
                  ? 'bg-[#FEF7E6] text-[#A15C07] border border-[#F6DFB1]'
                  : 'bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1]'
              }`}
            >
              {analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'WARNING' ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
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
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
            title="Refresh Live Junction Weather"
            aria-label="Refresh Live Junction Weather"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulator Scenario Bar */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-b border-gray-100 pb-2.5 text-xs">
        <span className="text-[11px] font-semibold text-gray-500 mr-1">Stress Scenarios:</span>
        <button
          type="button"
          data-testid="sim-fog-btn"
          onClick={() => {
            setSelectedHub('Delhi');
            setSimulatedScenario('delhi_dense_fog');
          }}
          className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
            simulatedScenario === 'delhi_dense_fog'
              ? 'border border-red-300 bg-red-50 text-red-800 font-semibold'
              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Delhi Winter Fog (&lt;250m)
        </button>
        <button
          type="button"
          data-testid="sim-monsoon-btn"
          onClick={() => {
            setSelectedHub('Mumbai');
            setSimulatedScenario('mumbai_monsoon');
          }}
          className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
            simulatedScenario === 'mumbai_monsoon'
              ? 'border border-blue-300 bg-blue-50 text-blue-800 font-semibold'
              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Mumbai Monsoon (26mm/h)
        </button>
        <button
          type="button"
          data-testid="sim-cyclone-btn"
          onClick={() => {
            setSelectedHub('Chennai');
            setSimulatedScenario('chennai_cyclone');
          }}
          className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
            simulatedScenario === 'chennai_cyclone'
              ? 'border border-amber-300 bg-[#FEF7E6] text-[#A15C07] font-semibold'
              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Cyclone Gale (72 km/h)
        </button>
        <button
          type="button"
          data-testid="sim-live-btn"
          onClick={() => setSimulatedScenario(null)}
          className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
            simulatedScenario === null
              ? 'border border-[#C6E8D1] bg-[#EDF7F0] text-[#137333] font-semibold'
              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Real-Time Open-Meteo
        </button>
      </div>

      {/* Meteorological Telemetry Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Thermometer className="h-3.5 w-3.5 text-amber-600" />
            <span>Temperature</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-900 tabular">
            {current?.temperature_2m !== undefined ? `${current.temperature_2m}°C` : '--'}
          </p>
          <span className="text-[10px] text-gray-500">{analysis?.weatherLabel || 'Fair'}</span>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            <span>Visibility</span>
          </div>
          <p
            className={`mt-1 text-sm font-bold tabular ${
              Number(analysis?.visibilityKm) < 1.0 ? 'text-red-600' : 'text-gray-900'
            }`}
            data-testid="weather-visibility-val"
          >
            {analysis?.visibilityKm !== undefined ? `${analysis.visibilityKm} km` : '--'}
          </p>
          <span className="text-[10px] text-gray-500">
            {Number(analysis?.visibilityKm) < 0.5
              ? 'Dense fog hazard'
              : Number(analysis?.visibilityKm) < 2.0
              ? 'Reduced visibility'
              : 'Clear visual'}
          </span>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <CloudRain className="h-3.5 w-3.5 text-blue-600" />
            <span>Precipitation</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-900 tabular">
            {current?.precipitation !== undefined ? `${current.precipitation} mm/h` : '0 mm/h'}
          </p>
          <span className="text-[10px] text-gray-500">
            {Number(current?.precipitation) > 10 ? 'High waterlogging' : 'Normal drainage'}
          </span>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Wind className="h-3.5 w-3.5 text-teal-600" />
            <span>Wind Velocity</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-900 tabular">
            {current?.wind_speed_10m !== undefined ? `${current.wind_speed_10m} km/h` : 'Not available'}
          </p>
          <span className="text-[10px] text-gray-500">
            {Number(current?.wind_speed_10m) > 50 ? 'Gale cautions' : 'Light breeze'}
          </span>
        </div>
      </div>

      {/* Multimodal Transit Impact Breakdown */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <TrainFront className="h-3.5 w-3.5 text-[#15803D]" />
            <span>Rail Impact</span>
          </div>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            {analysis?.trainImpact}
          </p>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
            <Plane className="h-3.5 w-3.5 text-blue-600" />
            <span>Aviation Impact</span>
          </div>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            {analysis?.flightImpact}
          </p>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#137333]">
            <BusFront className="h-3.5 w-3.5 text-[#15803D]" />
            <span>Road & Bus Impact</span>
          </div>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            {analysis?.roadImpact}
          </p>
        </div>
      </div>

      {/* Actionable Advice & Estimated Delay Banner */}
      <div className="mt-3 flex flex-col items-start justify-between gap-2.5 rounded border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Clock className="h-3.5 w-3.5 text-[#15803D]" />
            <span>Recommended Traveler Action:</span>
          </div>
          <p className="text-xs text-gray-600" data-testid="weather-recommended-action">
            {analysis?.recommendedAction}
          </p>
        </div>

        {analysis?.delayEstimateMinutes > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 rounded bg-[#FEF7E6] border border-[#F6DFB1] px-2.5 py-1 text-xs font-bold text-[#A15C07]">
            <span>Weather Delay Risk:</span>
            <span className="text-xs font-black tabular">+{analysis.delayEstimateMinutes}m</span>
          </div>
        )}
      </div>
    </section>
  );
}
