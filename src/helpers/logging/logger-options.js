import ecsFormat from '@elastic/ecs-pino-format'
import { config } from '~/src/config'

const loggerOptions = {
  enabled: !config.get('isTest'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
    remove: true
  },
  level: config.get('logLevel') || 'undefined',
  ...(config.get('isDevelopment')
    ? { transport: { target: 'pino-pretty' } }
    : ecsFormat()),
  customLevels: {
    undefined: 30 // Adding undefined level with a standard priority
  }
}

export { loggerOptions }
