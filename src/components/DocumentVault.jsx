import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Download, Eye, FileArchive, FileText, HardDrive, LockKeyhole, Shield, ShieldCheck, Trash2, UploadCloud } from 'lucide-react'
import {
  changeSecureVaultPassphrase,
  createSecureVault,
  deleteSecureDocument,
  exportEncryptedVaultBackup,
  hasLegacyDocumentStorage,
  importEncryptedVaultBackup,
  listSecureDocuments,
  purgeLegacyDocumentStorage,
  readSecureDocument,
  resetSecureVault,
  saveSecureDocument,
  secureVaultExists,
  unlockSecureVault,
  updateSecureDocument
} from '../utils/secureVault'

const categories = ['Passport', 'Visa', 'Aadhaar / ID', 'Ticket', 'Insurance', 'Hotel Proof', 'Emergency Contact', 'Other']

export default function DocumentVault({ toast }) {
  const keyRef = useRef(null)
  const [docs, setDocs] = useState([])
  const [hasVault, setHasVault] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [newPassphrase, setNewPassphrase] = useState('')
  const [newPassphraseConfirm, setNewPassphraseConfirm] = useState('')
  const [category, setCategory] = useState('Passport')
  const [filterCategory, setFilterCategory] = useState('All')
  const [documentLabel, setDocumentLabel] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [legacyDetected, setLegacyDetected] = useState(false)
  const [resetArmed, setResetArmed] = useState(false)

  useEffect(() => {
    let cancelled = false
    secureVaultExists()
      .then((exists) => { if (!cancelled) setHasVault(exists) })
      .catch((nextError) => { if (!cancelled) setError(nextError.message) })
    setLegacyDetected(hasLegacyDocumentStorage())

    const lock = () => {
      keyRef.current = null
      setUnlocked(false)
      setDocs([])
      setSuccess('Vault locked.')
    }
    window.addEventListener('travelmate:lock-vault', lock)
    return () => {
      cancelled = true
      keyRef.current = null
      window.removeEventListener('travelmate:lock-vault', lock)
    }
  }, [])

  function clearMessages() {
    setError('')
    setSuccess('')
  }

  async function refresh(key = keyRef.current) {
    if (!key) return
    setDocs(await listSecureDocuments(key))
  }

  async function run(task) {
    clearMessages()
    setBusy(true)
    try {
      await task()
    } catch (nextError) {
      setError(nextError?.message || 'Secure vault operation failed.')
    } finally {
      setBusy(false)
    }
  }

  async function createVault() {
    await run(async () => {
      if (passphrase !== confirmPassphrase) throw new Error('Passphrase and confirmation do not match.')
      const key = await createSecureVault(passphrase)
      keyRef.current = key
      setHasVault(true)
      setUnlocked(true)
      setPassphrase('')
      setConfirmPassphrase('')
      setSuccess('Encrypted vault created. The passphrase is never stored.')
      toast?.('Encrypted document vault created.')
    })
  }

  async function unlockVault() {
    await run(async () => {
      const key = await unlockSecureVault(passphrase)
      keyRef.current = key
      setUnlocked(true)
      setPassphrase('')
      await refresh(key)
      setSuccess('Encrypted vault unlocked for this tab.')
      toast?.('Encrypted document vault unlocked.')
    })
  }

  function lockVault() {
    keyRef.current = null
    setUnlocked(false)
    setDocs([])
    setPassphrase('')
    setSuccess('Vault locked. The encryption key was removed from memory.')
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    await run(async () => {
      await saveSecureDocument(keyRef.current, file, { category, note, label: documentLabel })
      await refresh()
      setDocumentLabel('')
      setNote('')
      event.target.value = ''
      setSuccess('Document encrypted with AES-GCM and stored in IndexedDB.')
      toast?.('Document encrypted and stored on this device.')
    })
  }

  async function viewDocument(doc) {
    const preview = window.open('', '_blank', 'noopener,noreferrer')
    if (!preview) {
      setError('The browser blocked the document preview. Allow pop-ups and try again.')
      return
    }
    await run(async () => {
      try {
        const { blob } = await readSecureDocument(keyRef.current, doc.id)
        const url = URL.createObjectURL(blob)
        preview.location.href = url
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      } catch (nextError) {
        preview.close()
        throw nextError
      }
    })
  }

  async function downloadDocument(doc) {
    await run(async () => {
      const { blob, metadata } = await readSecureDocument(keyRef.current, doc.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = metadata.name || doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
      setSuccess(`Downloaded decrypted "${metadata.name || doc.name}".`)
      toast?.('Document downloaded.')
    })
  }

  async function handleExportBackup() {
    await run(async () => {
      const json = await exportEncryptedVaultBackup()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `travelmate-encrypted-vault-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
      setSuccess('Encrypted backup exported. It remains protected by your passphrase.')
      toast?.('Encrypted vault backup exported.')
    })
  }

  async function handleImportBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    await run(async () => {
      const text = await file.text()
      const res = await importEncryptedVaultBackup(text)
      setHasVault(true)
      event.target.value = ''
      setSuccess(`Encrypted backup restored (${res.documentCount} documents). Enter passphrase to unlock.`)
      toast?.('Encrypted vault restored.')
    })
  }

  async function renameDocument(doc) {
    const next = window.prompt('Enter a new encrypted document label:', doc.category || doc.name)
    if (!next?.trim()) return
    await run(async () => {
      const extension = doc.name.match(/\.[A-Za-z0-9]+$/)?.[0] || ''
      const safeLabel = next.trim().replace(/[\\/:*?"<>|]+/g, '-')
      setDocs(await updateSecureDocument(keyRef.current, doc.id, { category: safeLabel, name: `${safeLabel}${extension}` }))
      setSuccess('Encrypted document label updated.')
    })
  }

  async function removeDocument(id) {
    if (!window.confirm('Delete this encrypted document permanently from this device?')) return
    await run(async () => {
      setDocs(await deleteSecureDocument(keyRef.current, id))
      setSuccess('Encrypted document deleted.')
      toast?.('Encrypted document deleted.')
    })
  }

  async function changePassphrase() {
    await run(async () => {
      if (newPassphrase !== newPassphraseConfirm) throw new Error('New passphrase and confirmation do not match.')
      const key = await changeSecureVaultPassphrase(keyRef.current, newPassphrase)
      keyRef.current = key
      setNewPassphrase('')
      setNewPassphraseConfirm('')
      setSuccess('Every document was re-encrypted with the new passphrase.')
      toast?.('Vault passphrase changed and documents re-encrypted.')
    })
  }

  async function resetVault() {
    if (!resetArmed) {
      setResetArmed(true)
      setError('Reset is destructive. Click “Delete vault permanently” again to confirm.')
      return
    }
    await run(async () => {
      keyRef.current = null
      await resetSecureVault()
      setDocs([])
      setHasVault(false)
      setUnlocked(false)
      setResetArmed(false)
      setSuccess('Encrypted vault permanently deleted from this device.')
      toast?.('Encrypted vault deleted.')
    })
  }

  function deleteLegacyData() {
    if (!window.confirm('Delete the old unencrypted vault data from localStorage? This cannot be undone.')) return
    if (purgeLegacyDocumentStorage()) {
      setLegacyDetected(false)
      setSuccess('Old unencrypted vault data deleted.')
      toast?.('Old unencrypted document data removed.')
    }
  }

  if (!unlocked) {
    return (
      <section className="mt-8 glass rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="badge"><LockKeyhole size={14} /> AES-GCM encrypted document vault</span>
            <h2 className="mt-3 text-2xl font-black text-white">Safety Mode Important Documents</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Files and metadata are encrypted before being stored in IndexedDB. The passphrase is not saved, uploaded, or recoverable. Losing it means losing access to the documents.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1"><Shield size={12} className="text-indigo-600" /> AES-GCM 256-Bit</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1"><LockKeyhole size={12} className="text-indigo-600" /> PBKDF2 (310k iter)</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1"><HardDrive size={12} className="text-emerald-700" /> Zero-Cloud Local IndexedDB</span>
            </div>
          </div>
          <span className="rounded-2xl border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">Encrypted · local-only · not copied into offline pack</span>
        </div>

        {legacyDetected && (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 shrink-0" size={18} /><span>An older TravelMate version left unencrypted document data in localStorage. Delete it before using this vault.</span></p>
            <button className="btn-danger mt-3" type="button" onClick={deleteLegacyData}>Delete old unencrypted data</button>
          </div>
        )}

        <div className="mt-5 grid gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-800 sm:col-span-2">
            <span className="mb-2 block">{hasVault ? 'Vault passphrase' : 'Create vault passphrase'}</span>
            <input className="input" type="password" autoComplete={hasVault ? 'current-password' : 'new-password'} value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="At least 8 characters" />
          </label>
          {!hasVault && (
            <label className="text-sm font-bold text-slate-800 sm:col-span-2">
              <span className="mb-2 block">Confirm passphrase</span>
              <input className="input" type="password" autoComplete="new-password" value={confirmPassphrase} onChange={(event) => setConfirmPassphrase(event.target.value)} placeholder="Repeat passphrase" />
            </label>
          )}
          {error && <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm font-bold text-red-100 sm:col-span-2">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100 sm:col-span-2">{success}</p>}
          <button className="btn-primary inline-flex items-center justify-center gap-2 sm:col-span-2" type="button" disabled={busy || legacyDetected} onClick={hasVault ? unlockVault : createVault}>
            <Eye size={18} /> {legacyDetected ? 'Delete old unencrypted data first' : busy ? 'Working…' : hasVault ? 'Unlock encrypted vault' : 'Create encrypted vault'}
          </button>
          {hasVault && (
            <button className="btn-danger sm:col-span-2" type="button" disabled={busy} onClick={resetVault}>
              {resetArmed ? 'Delete vault permanently' : 'Forgot passphrase? Reset encrypted vault'}
            </button>
          )}
          <div className="pt-2 sm:col-span-2 flex items-center justify-between border-t border-slate-700/40">
            <label className="cursor-pointer text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1.5">
              <FileArchive size={14} /> Restore encrypted backup (.json)
              <input type="file" accept=".json" className="sr-only" onChange={handleImportBackup} />
            </label>
            <span className="text-xs text-slate-500">Zero-server client encryption</span>
          </div>
        </div>
      </section>
    )
  }

  const filteredDocs = filterCategory === 'All'
    ? docs
    : docs.filter((d) => d.category === filterCategory || (filterCategory === 'Aadhaar / ID' && (d.category?.includes('Aadhaar') || d.category?.includes('ID'))))

  return (
    <section className="mt-8 glass rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge"><ShieldCheck size={14} /> Vault unlocked in this tab</span>
          <h2 className="mt-3 text-2xl font-black text-white">Encrypted Documents</h2>
          <p className="mt-2 text-sm text-slate-300">Closing, refreshing, signing out, or pressing Lock removes the encryption key from memory.</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5"><Shield size={11} className="text-indigo-600" /> AES-GCM 256-Bit</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5"><LockKeyhole size={11} className="text-indigo-600" /> PBKDF2 (310k iter)</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-soft inline-flex items-center gap-1 text-xs" type="button" data-testid="export-vault-backup" onClick={handleExportBackup}>
            <Download size={14} /> Export Backup
          </button>
          <button className="btn-soft text-xs" type="button" onClick={lockVault}>Lock vault</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-800"><span className="mb-2 block">Document type</span><select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-800"><span className="mb-2 block">Private label</span><input className="input" value={documentLabel} onChange={(event) => setDocumentLabel(event.target.value)} placeholder="Example: Passport front" /></label>
        <label className="text-sm font-bold text-slate-800 sm:col-span-2"><span className="mb-2 block">Private note</span><input className="input" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Optional note; encrypted with the file" /></label>
        <label className="btn-primary inline-flex cursor-pointer items-center justify-center gap-2 sm:col-span-2">
          <UploadCloud size={18} /> {busy ? 'Encrypting…' : 'Choose and encrypt document'}
          <input className="sr-only" type="file" disabled={busy} accept="application/pdf,image/*" onChange={handleUpload} />
        </label>
        <p className="text-xs text-slate-400 sm:col-span-2">Maximum 5 MB per file. Files are not uploaded and are not included in the localStorage offline pack.</p>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm font-bold text-red-100">{error}</p>}
      {success && <p className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">{success}</p>}

      <div className="mt-5 flex flex-wrap gap-1.5" role="toolbar" aria-label="Filter documents by category">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${filterCategory === cat ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {filteredDocs.length === 0 && <p className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-400">No encrypted documents stored under this category.</p>}
        {filteredDocs.map((doc) => (
          <article key={doc.id} className="rounded-2xl border border-slate-700/80 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-black text-white"><FileText size={17} /> <span className="truncate">{doc.name}</span></p>
                <p className="mt-1 text-xs text-slate-400">{doc.category} · {(Number(doc.size || 0) / 1024).toFixed(1)} KB · {doc.timestamp ? new Date(doc.timestamp).toLocaleString() : 'Encrypted'}</p>
                {doc.note && <p className="mt-2 text-sm text-slate-300">{doc.note}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {!doc.corrupted && <button className="btn-soft" type="button" onClick={() => viewDocument(doc)}><Eye size={16} /> View</button>}
                {!doc.corrupted && <button className="btn-soft" type="button" data-testid={`download-doc-${doc.id}`} onClick={() => downloadDocument(doc)}><Download size={16} /> Download</button>}
                {!doc.corrupted && <button className="btn-soft" type="button" onClick={() => renameDocument(doc)}>Rename</button>}
                <button className="btn-danger" type="button" onClick={() => removeDocument(doc.id)}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-800"><span className="mb-2 block">New passphrase</span><input className="input" type="password" autoComplete="new-password" value={newPassphrase} onChange={(event) => setNewPassphrase(event.target.value)} /></label>
        <label className="text-sm font-bold text-slate-800"><span className="mb-2 block">Confirm new passphrase</span><input className="input" type="password" autoComplete="new-password" value={newPassphraseConfirm} onChange={(event) => setNewPassphraseConfirm(event.target.value)} /></label>
        <button className="btn-soft sm:col-span-2" type="button" disabled={busy || !newPassphrase} onClick={changePassphrase}>Re-encrypt vault with new passphrase</button>
      </div>
    </section>
  )
}
