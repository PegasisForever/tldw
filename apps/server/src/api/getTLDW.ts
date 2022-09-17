import { z } from 'zod'
import { createRoute } from '../createRouter'
import { downloadYoutubeAudio } from './audioDownloadCache'
import { transcriptAudio } from './transcriptAudio'

const reqType = z.object({
  youtubeURL: z.string(),
})

const resType = z.object({
  id: z.string(),
  chapters: z.array(
    z.object({
      summary: z.string(),
      headline: z.string(),
      gist: z.string(),
      start: z.number(),
      end: z.number(),
    })
  ),
})

export const getTLDW = createRoute(reqType, resType, async ({ youtubeURL }) => {
  const audioPath = await downloadYoutubeAudio(youtubeURL)
  const transcriptedAudio = await transcriptAudio(audioPath)

  console.log(transcriptedAudio)
  return {
    id: transcriptedAudio.hash,
    chapters: transcriptedAudio.transcript.chapters,
  }
})
