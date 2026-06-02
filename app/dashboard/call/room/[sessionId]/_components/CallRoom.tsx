'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BrainCircuit, Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react'
import { saveTurn, endCall } from '@/actions/callActions'
import { cn } from '@/lib/utils'

type TPhase =
  | 'INITIALIZING'
  | 'AI_SPEAKING'
  | 'LISTENING'
  | 'RECORDING'
  | 'PROCESSING'
  | 'ENDING'

interface TTurn {
  role: 'USER' | 'AI'
  content: string
}

interface TProps {
  sessionId: string
  jobTitle: string
  company: string
  userName: string
}

const FREE_CALL_LIMIT = 5 * 60 // 5 minutes in seconds

export function CallRoom({ sessionId, jobTitle, company, userName }: TProps) {
  const router = useRouter()

  const [phase, setPhase] = useState<TPhase>('INITIALIZING')
  const [turns, setTurns] = useState<TTurn[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1
        if (next >= FREE_CALL_LIMIT) handleEndCall()
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, streamingText])

  // Request mic on mount and start the AI greeting
  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        triggerAITurn()
      })
      .catch(() => {
        setError('Microphone access denied. Please allow microphone and refresh.')
        setPhase('LISTENING')
      })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const triggerAITurn = useCallback(async (userMessage?: string) => {
    setPhase('AI_SPEAKING')
    setStreamingText('')

    try {
      const resp = await fetch('/api/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userMessage }),
      })

      if (!resp.ok || !resp.body) throw new Error('AI response failed')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        aiText += decoder.decode(value, { stream: true })
        setStreamingText(aiText)
      }

      // Save AI turn
      setTurns((prev) => [...prev, { role: 'AI', content: aiText }])
      setStreamingText('')
      await saveTurn(sessionId, 'AI', aiText)

      // Speak it
      await speak(aiText)
      setPhase('LISTENING')
    } catch {
      setError('Connection issue. Try ending and starting a new call.')
      setPhase('LISTENING')
    }
  }, [sessionId])

  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (isMuted) { resolve(); return }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.05
      utterance.pitch = 1.0
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
    })
  }

  async function handleStartRecording() {
    if (phase !== 'LISTENING' || !streamRef.current) return
    setPhase('RECORDING')
    audioChunksRef.current = []

    const mediaRecorder = new MediaRecorder(streamRef.current)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      setPhase('PROCESSING')
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      if (audioBlob.size < 1000) {
        setPhase('LISTENING')
        return
      }

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      try {
        const resp = await fetch('/api/call/transcribe', {
          method: 'POST',
          body: formData,
        })
        const { transcript } = await resp.json() as { transcript: string }

        if (!transcript?.trim()) { setPhase('LISTENING'); return }

        setTurns((prev) => [...prev, { role: 'USER', content: transcript }])
        await saveTurn(sessionId, 'USER', transcript)
        await triggerAITurn(transcript)
      } catch {
        setError('Transcription failed. Please try again.')
        setPhase('LISTENING')
      }
    }

    mediaRecorder.start()
  }

  function handleStopRecording() {
    if (phase !== 'RECORDING') return
    mediaRecorderRef.current?.stop()
  }

  async function handleEndCall() {
    setPhase('ENDING')
    window.speechSynthesis.cancel()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    await endCall(sessionId)

    // Generate report
    await fetch('/api/call/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })

    router.push(`/dashboard/report/${sessionId}`)
  }

  const timeLeft = FREE_CALL_LIMIT - elapsed
  const isWarning = timeLeft <= 60

  return (
    <div className="flex h-screen flex-col bg-zinc-950 lg:flex-row">
      {/* ── Main call area ─────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-between px-6 py-8">
        {/* Top bar */}
        <div className="flex w-full max-w-sm items-center justify-between">
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-400">{jobTitle}</p>
            <p className="text-xs text-zinc-600">{company}</p>
          </div>
          <div className={cn(
            'rounded-full border px-3 py-1 text-sm font-mono font-medium tabular-nums',
            isWarning
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-zinc-700 bg-zinc-900 text-zinc-400',
          )}>
            {formatTime(elapsed)}
          </div>
        </div>

        {/* AI Avatar */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {(phase === 'AI_SPEAKING' || phase === 'INITIALIZING') && (
              <>
                <div className="absolute -inset-5 rounded-full bg-violet-500/10 animate-ping" />
                <div className="absolute -inset-2 rounded-full bg-violet-500/15 animate-pulse" />
              </>
            )}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-violet-500/30 bg-violet-600/20">
              <BrainCircuit className={cn(
                'h-12 w-12 text-violet-400',
                (phase === 'AI_SPEAKING' || phase === 'INITIALIZING') && 'animate-pulse',
              )} />
            </div>
          </div>

          {/* Status label */}
          <div className="text-center">
            {phase === 'INITIALIZING' && <p className="text-sm text-zinc-500">Connecting…</p>}
            {phase === 'AI_SPEAKING' && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="inline-block w-1 rounded-full bg-violet-400"
                      style={{
                        height: `${8 + (i % 3) * 6}px`,
                        animation: 'waveBar 0.8s ease-in-out infinite',
                        animationDelay: `${i * 120}ms`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-violet-300">Speaking…</p>
              </div>
            )}
            {phase === 'LISTENING' && (
              <p className="text-sm text-zinc-400">
                Tap <span className="font-medium text-white">the mic</span> to speak
              </p>
            )}
            {phase === 'RECORDING' && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <p className="text-sm text-red-400">Recording — tap to stop</p>
              </div>
            )}
            {phase === 'PROCESSING' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-400">Processing…</p>
              </div>
            )}
            {phase === 'ENDING' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-400">Generating your report…</p>
              </div>
            )}
          </div>

          {error && (
            <p className="max-w-xs text-center text-xs text-red-400">{error}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full border transition-colors',
              isMuted
                ? 'border-red-500/30 bg-red-500/15 text-red-400'
                : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600',
            )}
            aria-label={isMuted ? 'Unmute AI' : 'Mute AI'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Main speak button */}
          <button
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            onClick={phase === 'RECORDING' ? handleStopRecording : phase === 'LISTENING' ? handleStartRecording : undefined}
            disabled={phase !== 'LISTENING' && phase !== 'RECORDING'}
            className={cn(
              'flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full border-2 transition-all duration-200',
              phase === 'RECORDING'
                ? 'scale-110 border-red-500/50 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20'
                : phase === 'LISTENING'
                  ? 'border-violet-500/40 bg-violet-600/20 text-violet-300 hover:border-violet-500/60 hover:bg-violet-600/30'
                  : 'cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-700',
            )}
            aria-label={phase === 'RECORDING' ? 'Stop recording' : 'Start recording'}
          >
            <Mic className="h-7 w-7" />
            <span className="text-[10px] font-medium">
              {phase === 'RECORDING' ? 'release' : 'speak'}
            </span>
          </button>

          <button
            onClick={handleEndCall}
            disabled={phase === 'ENDING'}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-600/15 text-red-400 transition-colors hover:bg-red-600/25 disabled:opacity-40"
            aria-label="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Transcript panel ───────────────────────── */}
      <div className="flex w-full flex-col border-t border-zinc-800 bg-zinc-900/40 lg:w-80 lg:border-l lg:border-t-0">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Live transcript
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {turns.map((turn, i) => (
            <div key={i} className={cn('flex gap-2', turn.role === 'USER' && 'flex-row-reverse')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                  turn.role === 'AI'
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-violet-600/20 text-zinc-200',
                )}
              >
                {turn.content}
              </div>
            </div>
          ))}
          {streamingText && (
            <div className="flex gap-2">
              <div className="max-w-[85%] rounded-xl bg-zinc-800 px-3 py-2 text-xs leading-relaxed text-zinc-300">
                {streamingText}
                <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-violet-400" />
              </div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Waveform keyframes */}
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
