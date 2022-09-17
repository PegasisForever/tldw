import { z } from 'zod'
import { createRoute } from '../createRouter'
import { downloadYoutubeAudio } from './audioDownloadCache'
import { transcriptAudio } from './transcriptAudio'
import { generateBulletPoints } from './bulletPoints'

const reqType = z.object({
  youtubeURL: z.string(),
})

const resType = z.object({
  id: z.string(),
  chapters: z.array(
    z.object({
      gist: z.string(),
      bullets: z.array(z.string()),
      start: z.number(),
      end: z.number(),
    })
  ),
})

export const getTLDW = createRoute(reqType, resType, async ({ youtubeURL }) => {
  const audioPath = await downloadYoutubeAudio(youtubeURL)
  const transcriptedAudio = await transcriptAudio(audioPath)
  const transcriptChapters = transcriptedAudio.transcript.chapters

  const chapters: z.infer<typeof resType>['chapters'] = []
  for (const transcriptChapter of transcriptChapters) {
    chapters.push({
      gist: transcriptChapter.gist,
      start: transcriptChapter.start,
      end: transcriptChapter.end,
      bullets: await generateBulletPoints(transcriptChapter.summary),
    })
  }
  return {
    id: transcriptedAudio.hash,
    chapters,
  }
})
