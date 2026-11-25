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
import { useDialogFocus } from '../hooks/useDialogFocus.js';

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
  const dialogRef = useDialogFocus({ isOpen: open, onClose });

  useEffect(() => {
    function handleKeyDown(e) {
      if (!open) return;
      if (e.key === 'ArrowRight') {
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
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-tour-title"
      data-testid="demo-tour-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 transition-all"
    >
      <div className="relative w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 shadow-xl text-gray-900 sm:p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Judge Demo Tour"
          className="dialog-close-button absolute right-4 top-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        {/* Progress Pill Bar */}
        <div className="mb-4 flex items-center gap-1.5">
          {TOUR_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-[#15803D]'
                  : idx < currentStep
                  ? 'bg-[#15803D]/40'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-[#EDF7F0] border border-[#C6E8D1] px-2.5 py-0.5 text-xs font-bold text-[#137333]">
            <Award size={12} />
            {current.badge}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {current.kicker}
          </span>
          <span className="ml-auto text-xs font-semibold text-gray-400">
            {currentStep + 1} of {TOUR_STEPS.length}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="mt-4 flex items-start gap-3.5">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-[#15803D]">
            <StepIcon size={24} />
          </div>
          <div>
            <h2
              id="demo-tour-title"
              data-testid="demo-tour-step-title"
              className="text-lg font-bold text-gray-900 sm:text-xl"
            >
              {current.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {current.summary}
            </p>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-2">
            Key Architectural Highlights:
          </span>
          <ul className="space-y-1.5 text-xs text-gray-700">
            {current.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-[#15803D] mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation & Action Bar */}
        <div className="mt-5 flex flex-col-reverse justify-between gap-2.5 sm:flex-row sm:items-center pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="demo-tour-prev-btn"
              onClick={handlePrev}
              disabled={isFirst}
              className={`flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 ${
                isFirst ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft size={15} />
              <span>Back</span>
            </button>
            <button
              type="button"
              data-testid="demo-tour-next-btn"
              onClick={handleNext}
              className="flex items-center gap-1 rounded bg-[#15803D] hover:bg-[#12733B] px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              <span>{isLast ? 'Complete Tour' : 'Next Innovation'}</span>
              {!isLast && <ChevronRight size={15} />}
            </button>
          </div>

          <button
            type="button"
            data-testid="demo-tour-action-btn"
            onClick={handleActionClick}
            className="flex items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            <span>{current.actionText}</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
