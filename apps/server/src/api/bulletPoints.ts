import cohere from 'cohere-ai'
import crypto from 'crypto'
import fs from 'fs'

const cachePath = '/home/pegasis/Projects/Websites/youtube-tldw-htn/bullets'

cohere.init(process.env.COHERE_KEY!)

async function _generateBulletPoints(text: string): Promise<string[]> {
  const response = await cohere.generate({
    model: 'xlarge',
    max_tokens: 150,
    temperature: 0.2,
    stop_sequences: ['----'],
    k: 0,
    p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    return_likelihoods: 'NONE',
    prompt: `Passage: Is Wordle getting tougher to solve? Players seem to be convinced that the game has gotten harder in recent weeks ever since The New York Times bought it from developer Josh Wardle in late January. The Times has come forward and shared that this likely isn’t the case. That said, the NYT did mess with the back end code a bit, removing some offensive and sexual language, as well as some obscure words There is a viral thread claiming that a confirmation bias was at play. One Twitter user went so far as to claim the game has gone to “the dusty section of the dictionary” to find its latest words.

Summarize in Points Form:
- Wordle players believe that the game has gotten harder since The New York Times bought.
- The Times shared that this isn’t the case, but that they did edit to code to remove explicit language and obscure words.
- A viral thread claims that a confirmation bias was at play. 
----
Passage: ArtificialIvan, a seven-year-old, London-based payment and expense management software company, has raised $190 million in Series C funding led by ARG Global, with participation from D9 Capital Group and Boulder Capital. Earlier backers also joined the round, including Hilton Group, Roxanne Capital, Paved Roads Ventures, Brook Partners, and Plato Capital.

Summarize in Points Form:
- ArtificialIvan, a payment and expense management software company, has raised $190 million in funding.
- Many earlier backers also joined the funding round.
----
Passage: ${text}

Summarize in Points Form:`,
  })
  const prediction = response.body.generations[0].text
  console.log(prediction)
  return prediction
    .split(/[\n-]/)
    .map(line => line.trim())
    .filter(line => line.length > 10)
}

export async function generateBulletPoints(text: string): Promise<string[]> {
  const hash = crypto.createHash('sha256')
  hash.update(text)
  const bulletPath = `${cachePath}/${hash.digest('hex')}.json`
  try {
    await fs.promises.access(bulletPath, fs.constants.F_OK)
    console.log('bullet points cache hit')
    return JSON.parse((await fs.promises.readFile(bulletPath)).toString('utf-8'))
  } catch (e) {
    // empty
  }

  console.log('start generating bullets')
  let points = await _generateBulletPoints(text)
  if (points.length <= 1) {
    console.log('retry generate bullets')
    points = await _generateBulletPoints(text)
  }

  await fs.promises.writeFile(bulletPath, JSON.stringify(points))
  return points
}
