'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeJob } from '@/actions/analyzeActions'
import { deleteResume } from '@/actions/resumeActions'
import { cn } from '@/lib/utils'
import {
  Plus,
  Trash2,
  BrainCircuit,
  Building2,
  User,
  FileText,
  Loader2,
  Link as LinkIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Briefcase,
} from 'lucide-react'

interface TInterviewerRow {
  id: string
  name: string
  title: string
  linkedinUrl: string
}

export interface TResumeOption {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface TProps {
  initialResumes: TResumeOption[]
}

const ANALYSIS_STEPS = [
  'Parsing job description…',
  'Researching the company…',
  'Profiling interviewers…',
  'Building your intelligence report…',
]

const INTERVIEW_STAGES = [
  { value: '', label: 'Select stage…' },
  { value: 'First screen / recruiter call', label: 'First screen / recruiter call' },
  { value: 'Technical round', label: 'Technical round' },
  { value: 'System design round', label: 'System design round' },
  { value: 'Take-home / assessment', label: 'Take-home / assessment' },
  { value: 'Cultural fit / behavioural', label: 'Cultural fit / behavioural' },
  { value: 'Final round', label: 'Final round' },
  { value: 'Panel interview', label: 'Panel interview' },
]

const WORK_ARRANGEMENTS = [
  { value: '', label: 'Select…' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
]

const EMPLOYMENT_TYPES = [
  { value: '', label: 'Select…' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
]

function uid() {
  return Math.random().toString(36).slice(2)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export function AnalyzeForm({ initialResumes }: TProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [interviewers, setInterviewers] = useState<TInterviewerRow[]>([])

  // CV / Resume state
  const [resumes, setResumes] = useState<TResumeOption[]>(initialResumes)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    initialResumes[0]?.id ?? null,
  )
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvError, setCvError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cvDragOver, setCvDragOver] = useState(false)
  const cvInputRef = useRef<HTMLInputElement>(null)

  // — Interviewer handlers ————————————————————————————————————

  function addInterviewer() {
    setInterviewers((prev) => [...prev, { id: uid(), name: '', title: '', linkedinUrl: '' }])
  }

  function removeInterviewer(id: string) {
    setInterviewers((prev) => prev.filter((i) => i.id !== id))
  }

  function updateInterviewer(
    id: string,
    field: keyof Omit<TInterviewerRow, 'id'>,
    value: string,
  ) {
    setInterviewers((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  // — CV upload handlers ————————————————————————————————————

  const handleCvFile = useCallback(async (file: File) => {
    setCvError(null)
    if (!ALLOWED_MIME.includes(file.type)) {
      setCvError('Unsupported type. Upload a PDF, DOCX, or TXT file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('File too large — maximum 5 MB.')
      return
    }
    setUploadingCv(true)
    const body = new FormData()
    body.append('file', file)
    try {
      const res = await fetch('/api/resume/upload', { method: 'POST', body })
      const data = (await res.json()) as {
        error?: string
        resumeId?: string
        fileName?: string
        fileSize?: number
        uploadedAt?: string
      }
      if (!res.ok || !data.resumeId) {
        setCvError(data.error ?? 'Upload failed. Please try again.')
      } else {
        const newCv: TResumeOption = {
          id: data.resumeId,
          fileName: data.fileName ?? file.name,
          fileSize: data.fileSize ?? file.size,
          uploadedAt: data.uploadedAt ?? new Date().toISOString(),
        }
        setResumes((prev) => [newCv, ...prev])
        setSelectedResumeId(newCv.id)
      }
    } catch {
      setCvError('Upload failed. Check your connection.')
    } finally {
      setUploadingCv(false)
    }
  }, [])

  const handleCvDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setCvDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleCvFile(file)
    },
    [handleCvFile],
  )

  const handleCvDelete = async (resumeId: string) => {
    setDeletingId(resumeId)
    const result = await deleteResume(resumeId)
    if (result.success) {
      setResumes((prev) => prev.filter((r) => r.id !== resumeId))
      if (selectedResumeId === resumeId) {
        const remaining = resumes.filter((r) => r.id !== resumeId)
        setSelectedResumeId(remaining[0]?.id ?? null)
      }
    }
    setDeletingId(null)
  }

  // — Form submit ———————————————————————————————————————————

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set(
      'interviewers',
      JSON.stringify(
        interviewers
          .filter((i) => i.name.trim())
          .map(({ name, title, linkedinUrl }) => ({ name, title, linkedinUrl })),
      ),
    )
    if (selectedResumeId) formData.set('resumeId', selectedResumeId)

    let step = 0
    const interval = setInterval(() => {
      step = Math.min(step + 1, ANALYSIS_STEPS.length - 1)
      setStepIndex(step)
    }, 4000)

    startTransition(async () => {
      const result = await analyzeJob(formData)
      clearInterval(interval)
      if (result.success) {
        router.push(`/dashboard/analyze/${result.analysisId}`)
      } else {
        setError(result.error)
        if ('fieldErrors' in result && result.fieldErrors) setFieldErrors(result.fieldErrors)
        setStepIndex(0)
      }
    })
  }

  // — Loading screen ————————————————————————————————————————

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600/20 border border-teal-500/30">
          <BrainCircuit className="h-8 w-8 text-teal-400 animate-pulse" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Analyzing…</h2>
        <p className="mb-8 text-sm text-zinc-500">This usually takes 15–30 seconds</p>
        <div className="w-full max-w-xs space-y-3">
          {ANALYSIS_STEPS.map((step, i) => (
            <div
              key={step}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all duration-500',
                i < stepIndex
                  ? 'border-teal-500/20 bg-teal-500/10 text-teal-400'
                  : i === stepIndex
                    ? 'border-teal-500/30 bg-teal-500/15 text-teal-300'
                    : 'border-zinc-800 bg-zinc-900/30 text-zinc-600',
              )}
            >
              {i < stepIndex ? (
                <span className="text-teal-400">✓</span>
              ) : i === stepIndex ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-zinc-700" />
              )}
              {step}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // — Form ——————————————————————————————————————————————————

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Role & Company ─────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <Building2 className="h-4 w-4 text-teal-400" />
          <h2 className="font-semibold text-white">Role &amp; Company</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="jobTitle" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Job title <span className="text-red-400">*</span>
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              className={cn(
                'w-full rounded-lg border bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30',
                fieldErrors['jobTitle'] ? 'border-red-500/50' : 'border-zinc-700',
              )}
            />
            {fieldErrors['jobTitle'] && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors['jobTitle'][0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="company" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Company <span className="text-red-400">*</span>
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              placeholder="e.g. Stripe"
              className={cn(
                'w-full rounded-lg border bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30',
                fieldErrors['company'] ? 'border-red-500/50' : 'border-zinc-700',
              )}
            />
            {fieldErrors['company'] && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors['company'][0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Job Description ────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-teal-400" />
          <h2 className="font-semibold text-white">Job Description</h2>
        </div>
        <label
          htmlFor="jobDescription"
          className="mb-1.5 block text-xs font-medium text-zinc-400"
        >
          Paste the full job posting <span className="text-red-400">*</span>
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          required
          rows={10}
          placeholder="Paste the entire job description here. Include responsibilities, requirements, nice-to-haves — everything. The more context you give, the better the analysis."
          className={cn(
            'w-full resize-none rounded-lg border bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30',
            fieldErrors['jobDescription'] ? 'border-red-500/50' : 'border-zinc-700',
          )}
        />
        {fieldErrors['jobDescription'] && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors['jobDescription'][0]}</p>
        )}
        <p className="mt-2 text-xs text-zinc-600">
          We&apos;ll also auto-detect any interviewers mentioned in the posting.
        </p>
      </div>

      {/* ── CV / Resume ────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-1 flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-teal-400" />
          <h2 className="font-semibold text-white">Your CV / Resume</h2>
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
            Optional
          </span>
        </div>
        <p className="mb-5 text-xs text-zinc-500">
          Lets the AI personalise readiness insights and suggest questions tailored to your
          background.
        </p>

        {/* Saved CVs list */}
        {resumes.length > 0 && (
          <div className="mb-4 space-y-2">
            {resumes.map((cv) => (
              <label
                key={cv.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  selectedResumeId === cv.id
                    ? 'border-teal-500/40 bg-teal-500/8'
                    : 'border-zinc-700/60 hover:border-zinc-600',
                )}
              >
                <input
                  type="radio"
                  name="_cvRadio"
                  checked={selectedResumeId === cv.id}
                  onChange={() => setSelectedResumeId(cv.id)}
                  className="accent-teal-500"
                />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                  <FileText className="h-4 w-4 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{cv.fileName}</p>
                  <p className="text-xs text-zinc-500">
                    {formatBytes(cv.fileSize)} &middot; {formatDate(cv.uploadedAt)}
                  </p>
                </div>
                {selectedResumeId === cv.id && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleCvDelete(cv.id)
                  }}
                  disabled={deletingId === cv.id}
                  title="Remove"
                  className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400 disabled:opacity-40"
                >
                  {deletingId === cv.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              </label>
            ))}

            {/* Deselect option */}
            {selectedResumeId && (
              <button
                type="button"
                onClick={() => setSelectedResumeId(null)}
                className="text-xs text-zinc-600 underline-offset-2 hover:text-zinc-400 hover:underline"
              >
                Don&apos;t use a CV for this analysis
              </button>
            )}
          </div>
        )}

        {/* Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setCvDragOver(true)
          }}
          onDragLeave={() => setCvDragOver(false)}
          onDrop={handleCvDrop}
          onClick={() => cvInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 transition-colors',
            cvDragOver
              ? 'border-teal-500 bg-teal-500/5'
              : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/60',
          )}
        >
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleCvFile(f)
              e.target.value = ''
            }}
          />
          {uploadingCv ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
              <span className="text-sm text-zinc-400">Extracting text…</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                {resumes.length > 0 ? 'Upload a different CV' : 'Upload your CV'}
              </span>
              <span className="text-xs text-zinc-600">PDF, DOCX, TXT · 5 MB max</span>
            </>
          )}
        </div>

        {cvError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {cvError}
          </div>
        )}
      </div>

      {/* ── Additional Job Details ─────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-1 flex items-center gap-2.5">
          <Briefcase className="h-4 w-4 text-teal-400" />
          <h2 className="font-semibold text-white">Additional Job Details</h2>
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
            Optional
          </span>
        </div>
        <p className="mb-5 text-xs text-zinc-500">
          The more context you give about the opportunity, the sharper the analysis — stage
          in particular helps the AI focus on what matters most right now.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Interview stage */}
          <div>
            <label
              htmlFor="interviewStage"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Interview stage
            </label>
            <select
              id="interviewStage"
              name="interviewStage"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
            >
              {INTERVIEW_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Work arrangement */}
          <div>
            <label
              htmlFor="workArrangement"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Work arrangement
            </label>
            <select
              id="workArrangement"
              name="workArrangement"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
            >
              {WORK_ARRANGEMENTS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          {/* Employment type */}
          <div>
            <label
              htmlFor="employmentType"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Employment type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="mt-4">
          <label
            htmlFor="jobLocation"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Location
          </label>
          <input
            id="jobLocation"
            name="jobLocation"
            type="text"
            placeholder="e.g. London, UK · or Remote (EU)"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>

        {/* Extra notes about the opportunity */}
        <div className="mt-4">
          <label
            htmlFor="jobNotes"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Anything else about this opportunity
          </label>
          <textarea
            id="jobNotes"
            name="jobNotes"
            rows={3}
            maxLength={600}
            placeholder="e.g. This role came through a referral, the team is currently 4 engineers, they're migrating from monolith to microservices…"
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>
      </div>

      {/* ── Interviewers ───────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <User className="h-4 w-4 text-teal-400" />
          <h2 className="font-semibold text-white">Interviewers &amp; Call Guests</h2>
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
            Optional
          </span>
        </div>
        <p className="mb-5 text-xs text-zinc-500">
          Add anyone you know will be on the call. We&apos;ll research their background and
          interview style.
        </p>

        {interviewers.length > 0 && (
          <div className="mb-4 space-y-3">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-4 sm:grid-cols-3"
              >
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Name *</label>
                  <input
                    type="text"
                    value={interviewer.name}
                    onChange={(e) => updateInterviewer(interviewer.id, 'name', e.target.value)}
                    placeholder="Sarah Chen"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Title</label>
                  <input
                    type="text"
                    value={interviewer.title}
                    onChange={(e) => updateInterviewer(interviewer.id, 'title', e.target.value)}
                    placeholder="Engineering Manager"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-teal-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-zinc-500">
                      <LinkIcon className="mr-1 inline h-3 w-3" />
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={interviewer.linkedinUrl}
                      onChange={(e) =>
                        updateInterviewer(interviewer.id, 'linkedinUrl', e.target.value)
                      }
                      placeholder="https://linkedin.com/in/…"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-teal-500/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInterviewer(interviewer.id)}
                    className="mt-5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addInterviewer}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-teal-500/40 hover:text-teal-400"
        >
          <Plus className="h-4 w-4" />
          Add interviewer
        </button>
      </div>

      {/* ── Submit ─────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-8 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
        >
          <BrainCircuit className="h-4 w-4" />
          Analyze &amp; build my report
        </button>
      </div>
    </form>
  )
}
