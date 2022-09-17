import fetch from 'node-fetch'
import fs from 'fs'
import crypto from 'crypto'

const cachePath = '/home/pegasis/Projects/Websites/youtube-tldw-htn/transcripts'

export async function getTranscriptFromHash(hash: string) {
  const transcriptPath = `${cachePath}/${hash}.json`
  return JSON.parse((await fs.promises.readFile(transcriptPath)).toString('utf-8'))
}

export async function transcriptAudio(filePath: string): Promise<{
  transcript: any
  hash: string
}> {
  const file = await fs.promises.readFile(filePath)
  const hash = crypto.createHash('sha256')
  hash.update(file)
  const strHash = hash.digest('hex')
  const transcriptPath = `${cachePath}/${strHash}.json`
  try {
    await fs.promises.access(transcriptPath, fs.constants.F_OK)
    console.log('transcript cache hit')
    return JSON.parse((await fs.promises.readFile(transcriptPath)).toString('utf-8'))
  } catch (e) {
    // empty
  }

  console.log('start transcription')
  let res = await fetch('https://api.assemblyai.com/v2/upload', {
    headers: {
      authorization: process.env.ASSEMBLYAI_KEY!,
      'Transfer-Encoding': 'chunked',
    },
    body: file,
    method: 'POST',
  })
  const { upload_url: uploadUrl } = await res.json()

  res = await fetch('https://api.assemblyai.com/v2/transcript', {
    headers: {
      authorization: process.env.ASSEMBLYAI_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: uploadUrl,
      auto_chapters: true,
    }),
    method: 'POST',
  })
  const { id: transcriptId } = await res.json()

  while (true) {
    await new Promise(r => setTimeout(r, 5000))
    console.log('try fetching')
    res = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        authorization: process.env.ASSEMBLYAI_KEY!,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
    const resJson = await res.json()
    if (resJson.status === 'completed') {
      await fs.promises.writeFile(transcriptPath, JSON.stringify(resJson))
      return {
        transcript: res,
        hash: strHash,
      }
    }
  }
}
