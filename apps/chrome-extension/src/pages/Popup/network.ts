import { createTRPCClient } from '@trpc/client'
import type { ServerRouter } from 'server'
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import useSWR, { KeyedMutator } from 'swr'
import { useEffect } from 'react'

export const client = createTRPCClient<ServerRouter>({
  url: 'http://localhost:8000',
})

export type ResOf<T extends keyof ServerRouter['_def']['queries']> = inferProcedureOutput<
  ServerRouter['_def']['queries'][T]
>

export function useQuerySWR<Key extends keyof ServerRouter['_def']['queries']>(
  key: Key,
  data: inferProcedureInput<ServerRouter['_def']['queries'][Key]> | null
): [
  ResOf<Key> | undefined,
  boolean,
  Error | undefined,
  KeyedMutator<inferProcedureOutput<ServerRouter['_def']['queries'][Key]>>
] {
  const {
    data: res,
    error,
    mutate,
  } = useSWR(data ? [key, data] : null, (key, data) => {
    return client.query(
      key,
      // @ts-ignore
      data
    )
  })

  useEffect(() => {
    if (error) console.log(error)
  }, [error, key])

  return [res, !res && !error, error, mutate]
}
