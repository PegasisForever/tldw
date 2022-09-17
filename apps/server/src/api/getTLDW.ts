import { z } from 'zod'
import { createRoute } from '../createRouter'
import { downloadYoutubeAudio } from './audioDownloadCache'

const SummaryDifficulty = z.enum(['simple', 'medium', 'advanced'])
const reqType = z.object({
  youtubeURL: z.string(),
  summaryDifficulty: SummaryDifficulty,
})

const resType = z.object({
  summary: z.string(),
})

export const getTLDW = createRoute(reqType, resType, async ({ youtubeURL, summaryDifficulty }) => {
  const audioPath = await downloadYoutubeAudio(youtubeURL)

  return {
    summary: '',
  }
})
