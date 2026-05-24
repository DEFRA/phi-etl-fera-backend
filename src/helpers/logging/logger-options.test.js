import ecsFormat from '@elastic/ecs-pino-format'
import { config } from '~/src/config'
import { loggerOptions } from '~/src/helpers/logging/logger-options' // Adjust the import according to the file location

jest.mock('@elastic/ecs-pino-format')
jest.mock('~/src/config')

describe('loggerOptions', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should include a custom level for undefined', () => {
    const ecsFormatMock = jest.fn().mockReturnValue({ ecsFormat: true })
    ecsFormat.mockImplementation(ecsFormatMock)

    config.get.mockImplementation((key) => {
      switch (key) {
        case 'isTest':
          return false
        case 'logLevel':
          return undefined
        case 'isDevelopment':
          return false
        default:
          return undefined
      }
    })

    const expectedOptions = {
      enabled: true,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers',
          'sensitive'
        ],
        remove: true
      },
      level: undefined
    }

    expect(loggerOptions).toEqual(expectedOptions)
  })

  it('should disable logging when isTest is true', () => {
    config.get.mockImplementation((key) => {
      switch (key) {
        case 'isTest':
          return true
        case 'logLevel':
          return 'info'
        default:
          return undefined
      }
    })

    const expectedOptions = {
      enabled: true,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers',
          'sensitive'
        ],
        remove: true
      },
      level: undefined
    }

    expect(loggerOptions).toEqual(expectedOptions)
  })
})
