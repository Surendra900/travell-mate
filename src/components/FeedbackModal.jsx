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
    toast?.('Thank you for your feedback! It helps improve route accuracy.')
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback modal"
          data-testid="feedback-close-btn"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 id="feedback-modal-title" className="text-xl font-black text-white">
              Traveler Feedback
            </h2>
            <p className="text-xs text-slate-400">
              Anonymous & zero-tracking. Help us refine India route recovery.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-8 py-8 text-center" data-testid="feedback-success-state">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
            <h3 className="mt-3 text-lg font-bold text-white">Feedback Received!</h3>
            <p className="mt-1 text-xs text-slate-300">Your insights help keep junction transfer slack realistic.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={24}
                      className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-300">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="feedback-category" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Topic Category
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="route_accuracy">Route & Junction Accuracy</option>
                <option value="timing">Transfer Buffer Slack</option>
                <option value="ui">User Experience & Accessibility</option>
                <option value="suggestion">New Station / Corridor Request</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="feedback-comments" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Thoughts or Experience
              </label>
              <textarea
                id="feedback-comments"
                rows={3}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share how your route worked, or if any transfer buffer was too tight..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-[11px] text-emerald-300">
              <ShieldCheck size={14} className="shrink-0" />
              <span>DPDP 2023 Compliant: Strictly zero identity or phone numbers collected.</span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="submit-feedback-btn"
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-cyan-900/40 transition-colors"
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
