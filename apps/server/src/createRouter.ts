import { z, ZodType } from 'zod'
import { CreateFastifyContextOptions } from '@trpc/server/dist/declarations/src/adapters/fastify'
import * as admin from 'firebase-admin'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import { PrismaClient } from '@prisma/client'
import * as trpc from '@trpc/server'
import { logger } from './logger'

const prisma = new PrismaClient()
const auth = admin.auth()

export async function decodeAuthHeader(authorization: string | undefined): Promise<DecodedIdToken | null> {
  try {
    const token = authorization?.split(' ')?.[1]
    if (token) {
      return await auth.verifyIdToken(token)
    }
  } catch (e) {
    // empty
  }
  return null
}

type LoggerMethod = {
  (msg: string): void
  (obj: Record<string, unknown>, msg?: string): void
  (error: Error, msg?: string): void
}

export async function createContext({ req }: CreateFastifyContextOptions) {
  const decodedToken = await decodeAuthHeader(req.headers.authorization)

  const logMeta = {
    requestId: req.id,
    userId: decodedToken?.uid ?? null,
  }
  const createLoggerMethod = (fn: any) => {
    fn = fn.bind(logger)
    return ((a, b) => {
      if (typeof a === 'string') {
        fn(logMeta, a)
      } else if (a instanceof Error) {
        fn(a, b)
      } else {
        fn({ ...a, ...logMeta }, b)
      }
    }) as LoggerMethod
  }

  const requestLogger = {
    debug: createLoggerMethod(logger.debug),
    info: createLoggerMethod(logger.info),
    warn: createLoggerMethod(logger.warn),
    error: createLoggerMethod(logger.error),
    fatal: createLoggerMethod(logger.fatal),
  }

  if (!decodedToken) return { user: null, logger: requestLogger }

  let userProfile = await prisma.userProfile.findUnique({
    where: {
      id: decodedToken.uid,
    },
  })

  if (!userProfile) {
    const fbUser = await auth.getUser(decodedToken.uid)
    userProfile = {
      id: fbUser.uid,
      name: fbUser.displayName ?? fbUser.email?.split('@')?.[0] ?? fbUser.uid.substring(0, 6),
      email: fbUser.email ?? null,
      profilePhotoURL: fbUser.photoURL ?? null,
      serviceAreaName: 'McMaster',
    }

    await prisma.userProfile.upsert({
      where: {
        id: userProfile!.id,
      },
      update: userProfile!,
      create: userProfile!,
    })
  }

  return { user: userProfile, logger: requestLogger }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>

type AnyZodType = ZodType<any, any, any>

export type RouteBaseFn<reqType extends AnyZodType, resType extends AnyZodType> = (
  input: z.infer<reqType>,
  ctx: Context
) => Promise<z.infer<resType>>

export function createRoute<A extends AnyZodType, B extends AnyZodType>(reqType: A, resType: B, fn: RouteBaseFn<A, B>) {
  return {
    input: reqType,
    output: resType,
    resolve: ({ input, ctx }: { input: z.infer<typeof reqType>; ctx: Context }) => fn(input, ctx),
  }
}

export function createRouter() {
  return trpc.router<Context>()
}
