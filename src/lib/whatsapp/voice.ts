import OpenAI from 'openai'

let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[Voice] OPENAI_API_KEY not configured')
    return null
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  return openai
}

export async function transcribeVoiceNote(
  mediaUrl: string,
  twilioAccountSid: string,
  twilioAuthToken: string
): Promise<string | null> {
  try {
    const client = getOpenAIClient()
    if (!client) {
      console.error('[Voice] OpenAI client not available')
      return null
    }

    // Fetch audio from Twilio with auth
    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(
          `${twilioAccountSid}:${twilioAuthToken}`
        ).toString('base64')
      }
    })

    if (!response.ok) {
      console.error('[Voice] Failed to fetch audio:', response.status)
      return null
    }

    const audioBuffer = await response.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' })
    const audioFile = new File([audioBlob], 'voice-note.ogg', {
      type: 'audio/ogg'
    })

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en'
    })

    console.log('[Voice] Transcribed:', transcription.text)
    return transcription.text

  } catch (error) {
    console.error('[Voice] Transcription error:', error)
    return null
  }
}
