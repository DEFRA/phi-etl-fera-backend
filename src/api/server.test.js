import path from 'path'
import hapi from '@hapi/hapi'
import { config } from '~/src/config'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { failAction } from '~/src/helpers/fail-action'
import { createServer } from '~/src/api/server' // Adjust the import according to the file location

jest.mock('@hapi/hapi')
jest.mock('~/src/config')
jest.mock('~/src/api/router')
jest.mock('~/src/helpers/logging/request-logger')
jest.mock('~/src/helpers/mongodb')
jest.mock('~/src/helpers/fail-action')
jest.mock('~/src/helpers/secure-context')
jest.mock('hapi-pino')
jest.mock('../../src')
jest.mock('@elastic/ecs-pino-format')
jest.mock('hapi-pino')
jest.mock('~/src/helpers/logging/logger-options', () => ({
  customLevels: {
    default: 'info',
    levels: {
      info: 30,
      warn: 40,
      error: 50
    }
  }
}))

describe('createServer', () => {
  let server

  beforeEach(() => {
    server = {
      register: jest.fn()
    }
    hapi.server.mockReturnValue(server)

    config.get = jest.fn()
    config.get.mockImplementation((key) => {
      switch (key) {
        case 'port':
          return 3000
        case 'root':
          return __dirname
        case 'isProduction':
          return true
        default:
          return undefined
      }
    })
  })

  it('should create a server with the correct configuration and register plugins', async () => {
    await createServer()
    // Spy on the register method
    const registerSpy = jest.spyOn(server, 'register')

    // Verify the register method was called with requestLogger
    expect(registerSpy).toHaveBeenCalledWith(requestLogger)

    // Verify the server configuration
    expect(hapi.server).toHaveBeenCalledWith({
      port: 3000,
      routes: {
        validate: {
          options: {
            abortEarly: false
          },
          failAction
        },
        files: {
          relativeTo: path.resolve(__dirname, '.public')
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
      state: {
        strictHeader: false
      },
      router: {
        stripTrailingSlash: true
      }
    })

    // Verify plugins registration
    expect(server.register).toHaveBeenCalledWith(requestLogger)
    expect(server.register).toHaveBeenCalledWith({
      plugin: mongoPlugin,
      options: {}
    })
    expect(server.register).toHaveBeenCalledWith(router)
  })
})
