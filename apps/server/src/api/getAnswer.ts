import { z } from 'zod'
import { createRoute } from '../createRouter'

const reqType = z.object({
  id: z.string(),
  question: z.string(),
})

const resType = z.object({
  answer: z.string(),
})

export const getAnswer = createRoute(reqType, resType, async ({ id, question }) => {
  return {
    answer: 'awa',
  }
})
