import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const MAX_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let rawText = ''

  try {
    if (file.type === 'application/pdf') {
      const result = await pdfParse(buffer)
      rawText = result.text
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer })
      rawText = result.value
    } else {
      rawText = buffer.toString('utf-8')
    }
  } catch {
    return NextResponse.json(
      { error: 'Could not read file. Please try another format.' },
      { status: 422 },
    )
  }

  rawText = rawText.trim()
  if (!rawText) {
    return NextResponse.json(
      { error: 'No text could be extracted from this file.' },
      { status: 422 },
    )
  }

  const resume = await db.resume.create({
    data: {
      userId: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      rawText,
    },
  })

  return NextResponse.json({
    resumeId: resume.id,
    fileName: resume.fileName,
    fileSize: resume.fileSize,
    uploadedAt: resume.uploadedAt.toISOString(),
  })
}
