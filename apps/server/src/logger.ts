import bunyan from 'bunyan'

export const logger = bunyan.createLogger({
  name: 'bpsn-server',
  streams: [{ stream: process.stdout, level: 'info' }],
})
