import path from 'path'
import hapi from '@hapi/hapi'
import { config } from '~/src/config'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { failAction } from '~/src/helpers/fail-action'
import { secureContext } from '~/src/helpers/secure-context'
import { s3Client } from '~/src/fera_integration/config/s3Config'

const isProduction = config.get('isProduction')
async function createServer() {
  const server = hapi.server({
    port: config.get('port'),
    state: {
      // parse and store in request.state
      strictHeader: false // may also be 'ignore' or 'log'
    },
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  // Registering additional plugins
  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register({ plugin: mongoPlugin, options: {} })
  await server.register(router)

  const options = {
    region: config.get('aws.region'),
    endpoint: config.get('aws.s3.endpoint'),
    forcePathStyle: config.get('aws.s3.forcePathStyle')
  }
  await server.register({ plugin: s3Client.plugin, options })

  return server
}

export { createServer }
