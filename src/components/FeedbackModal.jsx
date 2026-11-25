import { useState } from 'react'
import { MessageSquare, Star, X, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

export default function FeedbackModal({ open, onClose, toast }) {
  const [rating, setRating] = useState(5)
  const [category, setCategory] = useState('route_accuracy')
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useDialogFocus({ isOpen: open, onClose })

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const stored = JSON.parse(localStorage.getItem('travelmate-feedback-history') || '[]')
      const entry = {
        id: `fb-${Date.now()}`,
        rating,
        category,
        comments: comments.trim(),
        submittedAt: new Date().toISOString()
      }
      stored.unshift(entry)
      localStorage.setItem('travelmate-feedback-history', JSON.stringify(stored.slice(0, 10)))
    } catch {}

    setSubmitted(true)
    toast?.('Thank you for your feedback. It helps improve route accuracy.')
    setTimeout(() => {
      setSubmitted(false)
      setComments('')
      onClose()
    }, 1500)
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      data-testid="feedback-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 text-gray-900 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback modal"
          data-testid="feedback-close-btn"
          className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#15803D] text-white">
            <MessageSquare size={17} />
          </div>
          <div>
            <h2 id="feedback-modal-title" className="text-base font-bold text-gray-900">
              Traveler Feedback
            </h2>
            <p className="text-xs text-gray-500">
              Anonymous & zero-tracking. Help us refine India route recovery.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-6 py-6 text-center" role="status" aria-live="polite" data-testid="feedback-success-state">
            <CheckCircle2 size={40} className="mx-auto text-[#137333]" />
            <h3 className="mt-2.5 text-base font-bold text-gray-900">Feedback Received</h3>
            <p className="mt-1 text-xs text-gray-600">Your insights help keep junction transfer slack realistic.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`Score ${star} of 5`}
                  >
                    <Star
                      size={20}
                      className={star <= rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-gray-700">{rating} / 5</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="feedback-category" className="block text-xs font-semibold text-gray-700 mb-1">
                Topic Category
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 font-medium focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] outline-none"
              >
                <option value="route_accuracy">Route & Junction Accuracy</option>
                <option value="timing">Transfer Buffer Slack</option>
                <option value="ui">User Experience & Accessibility</option>
                <option value="suggestion">New Station / Corridor Request</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="feedback-comments" className="block text-xs font-semibold text-gray-700 mb-1">
                Your Thoughts or Experience
              </label>
              <textarea
                id="feedback-comments"
                rows={3}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share how your route worked, or if any transfer buffer was too tight..."
                className="w-full rounded border border-gray-300 bg-white p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded border border-[#C6E8D1] bg-[#EDF7F0] p-2.5 text-xs text-[#137333]">
              <ShieldCheck size={14} className="shrink-0" />
              <span>DPDP 2023 Compliant: Strictly zero identity or phone numbers collected.</span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="submit-feedback-btn"
                className="rounded bg-[#15803D] hover:bg-[#12733B] px-4 py-1.5 text-xs font-semibold text-white transition"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
