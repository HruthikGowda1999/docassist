import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// System prompt used for all providers
const systemPrompt = `
You are a helpful medical assistant who only answers medical and health-related questions.
Please respond in a casual and friendly manner.
If the question is not medical or health-related, politely let the user know that you can only help with medical topics and suggest they ask something related to health or medicine.
If the user's question or description indicates a severe, urgent, or potentially life-threatening condition (e.g., chest pain, difficulty breathing, severe bleeding, unconsciousness, sudden severe headache, high fever in infants, etc.),
politely but clearly advise them to seek immediate medical attention or book an appointment with a healthcare professional as soon as possible.
`

// Gemini call function
async function callGemini(question) {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${question}` }]
      }
    ]
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  const answer =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sorry, I couldn’t get a response from Gemini.'

  return answer
}

// OpenAI fallback call function
async function callOpenAI(question) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    max_tokens: 500
  })

  const answer = completion.choices[0].message.content.trim()
  return answer
}

// Main API route handler
export async function POST(req) {
  try {
    const { question } = await req.json()

    if (!question) {
      return NextResponse.json({ message: 'Question is required' }, { status: 400 })
    }

    let answer = ''
    let providerUsed = 'Gemini'

    try {
      answer = await callGemini(question)
    } catch (geminiErr) {
      console.warn('Gemini failed, switching to OpenAI:', geminiErr.message)
      answer = await callOpenAI(question)
      providerUsed = 'OpenAI'
    }

    const isSerious =
      answer.toLowerCase().includes('immediate medical attention') ||
      answer.toLowerCase().includes('book an appointment')

    return NextResponse.json({ answer, isSerious, provider: providerUsed })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ message: 'Unexpected server error' }, { status: 500 })
  }
}
