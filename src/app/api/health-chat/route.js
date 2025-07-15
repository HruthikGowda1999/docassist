import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// System prompt used for all providers
const systemPrompt = `
You are a helpful medical assistant who only answers pregnancy-related medical and health questions.
Please respond in a friendly and casual tone, appropriate for expecting mothers or those seeking pregnancy care advice.

If the question is not related to pregnancy (e.g., general health, non-medical topics, or unrelated medical concerns), politely inform the user that you can only assist with pregnancy-related topics and suggest they ask something about pregnancy, maternal care, prenatal health, labor, or similar topics.

If the user's question or description indicates a severe, urgent, or potentially life-threatening pregnancy-related condition (e.g., heavy vaginal bleeding, severe abdominal pain, blurred vision, high fever, seizures, no fetal movement, signs of preeclampsia, etc.),
politely but firmly advise them to seek immediate medical attention or contact a healthcare provider as soon as possible.
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
