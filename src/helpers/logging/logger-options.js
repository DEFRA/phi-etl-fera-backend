import ecsFormat from '@elastic/ecs-pino-format'
import { config } from '~/src/config'
const isDevelopment = config.get('isDevelopment')
const redactionPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers'
]

if (!isDevelopment) {
  redactionPaths.push('sensitive')
}

if (isDevelopment) {
  redactionPaths.push('req', 'res', 'responseTime')
}

const loggerOptions = {
  enabled: !config.get('isTest'),
  redact: {
    paths: redactionPaths,
    remove: true
  },
  level: config.get('logLevel'),
  ...(isDevelopment ? { transport: { target: 'pino-pretty' } } : ecsFormat())
}

export { loggerOptions }
