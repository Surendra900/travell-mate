import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Route,
  Volume2,
  Lock,
  CloudFog,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Award,
  CheckCircle2
} from 'lucide-react';

import { TOUR_STEPS } from '../data/demoTourData.js';

const ICON_MAP = {
  'route': Route,
  'volume-2': Volume2,
  'lock': Lock,
  'cloud-fog': CloudFog,
  'shield-alert': ShieldAlert
};

export { TOUR_STEPS };

export default function DemoTourModal({ open, onClose, onLaunchVoiceGate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentStep]);

  if (!open) return null;

  const current = TOUR_STEPS[currentStep];
  const StepIcon = ICON_MAP[current.iconKey] || Route;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentStep((s) => s - 1);
    }
  }

  function handleActionClick() {
    if (current.step === 2 && onLaunchVoiceGate) {
      onClose();
      onLaunchVoiceGate();
      return;
    }
    onClose();
    navigate(current.targetRoute);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-tour-title"
      data-testid="demo-tour-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md transition-all"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Judge Demo Tour"
          className="dialog-close-button absolute right-5 top-5 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Progress Pill Bar */}
        <div className="mb-6 flex items-center gap-1.5">
          {TOUR_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                  : idx < currentStep
                  ? 'bg-cyan-500/50'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-300">
            <Award size={13} />
            {current.badge}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {current.kicker}
          </span>
          <span className="ml-auto text-xs font-bold text-slate-400">
            Innovation {currentStep + 1} of {TOUR_STEPS.length}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="mt-5 flex items-start gap-4">
          <div className={`rounded-2xl border p-3.5 ${current.iconColor}`}>
            <StepIcon size={28} />
          </div>
          <div>
            <h2
              id="demo-tour-title"
              data-testid="demo-tour-step-title"
              className="text-2xl font-black text-white sm:text-3xl"
            >
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {current.summary}
            </p>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Key Architectural Highlights:
          </span>
          <ul className="mt-2 space-y-2 text-xs text-slate-200">
            {current.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-cyan-400 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation & Action Bar */}
        <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="demo-tour-prev-btn"
              onClick={handlePrev}
              disabled={isFirst}
              className={`flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white ${
                isFirst ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              data-testid="demo-tour-next-btn"
              onClick={handleNext}
              className="flex items-center gap-1 rounded-xl border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30"
            >
              <span>{isLast ? 'Complete Tour' : 'Next Innovation'}</span>
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>

          <button
            type="button"
            data-testid="demo-tour-action-btn"
            onClick={handleActionClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110"
          >
            <span>{current.actionText}</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
