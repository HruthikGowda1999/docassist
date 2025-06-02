import { NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ message: 'Question is required' }, { status: 400 });
    }

    const systemPrompt = `
      You are a helpful medical assistant who only answers medical and health-related questions.
      Please respond in a casual and friendly manner.
      If the question is not medical or health-related, politely let the user know that you can only help with medical topics and suggest they ask something related to health or medicine.
      If the user's question or description indicates a severe, urgent, or potentially life-threatening condition (e.g., chest pain, difficulty breathing, severe bleeding, unconsciousness, sudden severe headache, high fever in infants, etc.),
      politely but clearly advise them to seek immediate medical attention or book an appointment with a healthcare professional as soon as possible.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 500
    });

    const answer = completion.choices[0].message.content;
    
    // Check if the response indicates a serious condition
    const isSerious = answer.toLowerCase().includes('immediate medical attention') || 
                      answer.toLowerCase().includes('book an appointment');
    
    return NextResponse.json({ answer, isSerious });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

