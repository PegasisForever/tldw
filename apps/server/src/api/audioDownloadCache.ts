// @ts-ignore
import ytcog from 'ytcog'
import fs from 'fs'

const cachePath = '/home/pegasis/Projects/Websites/youtube-tldw-htn/mp3'

export async function downloadYoutubeAudio(videoId: string) {
  const videoPath = `${cachePath}/${videoId}.mp3`
  try {
    await fs.promises.access(videoPath, fs.constants.F_OK)
    console.log('youtube audio download cache hit')
    return videoPath
  } catch (e) {
    // empty
  }

  console.log('downloading youtube audio')
  await ytcog.dl({
    id: videoId,
    path: cachePath,
    filename: '${id}',
    container: 'mp3',
    videoQuality: 'none',
    audioQuality: 'lowest',
  })

  return videoPath
}
