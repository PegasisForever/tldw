import { z } from 'zod'
import { createRoute } from '../createRouter'
import { getTranscriptFromHash } from './transcriptAudio'
import { answerQuestion } from './answerQuestion'

const reqType = z.object({
  id: z.string(),
  question: z.string(),
})

const resType = z.object({
  answer: z.string().nullable(),
})

export const getAnswer = createRoute(reqType, resType, async ({ id, question }) => {
  const { text } = await getTranscriptFromHash(id)
  const answer = await answerQuestion(text, question)

  return {
    answer,
  }
})
