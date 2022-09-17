import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
})
const openai = new OpenAIApi(configuration)

export async function answerQuestion(text: string, question: string) {
  const response = await openai.createCompletion({
    model: 'text-davinci-002',
    temperature: 0,
    max_tokens: 100,
    prompt: `I am a highly intelligent question answering bot. If you ask me a question that is included in the paragraph, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown".

The paragraph:
${text}

The question: ${question}
Answer the question in detail:`,
  })

  const answer = response.data.choices?.[0]?.text?.trim()
  if (!answer || answer.startsWith('unknown') || answer.startsWith('Unknown')) {
    return null
  } else {
    return answer
  }
}
