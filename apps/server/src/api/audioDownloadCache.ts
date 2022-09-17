// @ts-ignore
import ytcog from 'ytcog'
import fs from 'fs'

const cachePath = '/home/pegasis/Projects/Websites/youtube-tldw-htn/mp3'
const youtubeIdRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/

function parseYoutubeId(url: string) {
  const match = url.match(youtubeIdRegex)
  if (match && match[7].length === 11) {
    return match[7]
  } else {
    throw new Error('Failed to parse youtube video id')
  }
}

export async function downloadYoutubeAudio(url: string) {
  const videoId = parseYoutubeId(url)
  const videoPath = `${cachePath}/${videoId}.mp3`
  try {
    await fs.promises.access(videoPath, fs.constants.F_OK)
    console.log('youtube audio download cache hit')
    return videoPath
  } catch (e) {
    // empty
    console.log(e)
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
