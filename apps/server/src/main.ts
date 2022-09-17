import 'dotenv/config'
import './gcp'
import fastify from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { createContext, createRouter } from './createRouter'
import { nanoid } from 'nanoid'
import { logger } from './logger'
import { getTLDW } from './api/getTLDW'
import { getAnswer } from './api/getAnswer'

const server = fastify({
  genReqId: () => nanoid(),
})

server.register(fastifyMultipart)

server.register(cors, {
  origin: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

const router = createRouter()
  .middleware(async ({ path, ctx: { logger }, type, next }) => {
    logger.info({ path, type }, 'Received request')
    const start = Date.now()
    const result = await next()
    const durationMs = Date.now() - start
    if (result.ok) {
      logger.info({ path, durationMs }, 'Request completed')
    } else {
      logger.warn({ path, durationMs }, 'Request failed')
    }
    return result
  })
  .query('getTLDW', getTLDW)
  .query('getAnswer', getAnswer)

server.register(fastifyTRPCPlugin, {
  prefix: '/',
  trpcOptions: {
    router,
    createContext,
  },
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000
server.listen(port, '0.0.0.0').then(() => logger.info(`Server listening at ${port}.`))

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`unhandledRejection\nPromise: ${promise}\nReason: ${reason}`)
  process.exitCode = 1
})

process.on('uncaughtException', err => {
  logger.error(err)
  process.exitCode = 1
})

export type ServerRouter = typeof router
