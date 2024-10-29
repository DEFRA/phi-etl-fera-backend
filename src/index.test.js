import { config } from '~/src/config'
import { createServer } from '~/src/api/server'
import { createLogger } from '~/src/helpers/logging/logger'

jest.mock('~/src/config')
jest.mock('~/src/api/server')
jest.mock('~/src/helpers/logging/logger')

const logger = {
  info: jest.fn(),
  error: jest.fn()
}
createLogger.mockReturnValue(logger)

process.on('unhandledRejection', (error) => {
  logger?.info('Unhandled rejection')
  logger?.error(error)
  process.exit(1)
})

async function startServer() {
  try {
    const server = await createServer()
    await server.start()

    server.logger?.info('Server started successfully')
    server.logger?.info(
      `Access your backend on http://localhost:${config.get('port')}`
    )
  } catch (error) {
    logger?.info('Server failed to start :(')
    logger?.error(error)
    throw error // Ensure the error is re-thrown for proper test handling
  }
}

describe('Server startup', () => {
  let server

  beforeEach(() => {
    server = {
      start: jest.fn(),
      logger: {
        info: jest.fn()
      }
    }
    createServer.mockResolvedValue(server)

    config.get = jest.fn().mockReturnValue(3000)

    jest.spyOn(process, 'exit').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should start the server and log success messages', async () => {
    await startServer()

    expect(createServer).toHaveBeenCalled()
    expect(server.start).toHaveBeenCalled()
    expect(server.logger.info).toHaveBeenCalledWith(
      'Server started successfully'
    )
    expect(server.logger.info).toHaveBeenCalledWith(
      'Access your backend on http://localhost:3000'
    )
  })

  it('should log an error if server fails to start', async () => {
    const error = new Error('Server start error')
    createServer.mockRejectedValue(error)

    await expect(startServer()).rejects.toThrow('Server start error')

    expect(logger.info).toHaveBeenCalledWith('Server failed to start :(')
    expect(logger.error).toHaveBeenCalledWith(error)
  })

  it('should handle unhandled rejections', () => {
    const error = new Error('Unhandled rejection error')
    process.emit('unhandledRejection', error)

    expect(logger.info).toHaveBeenCalledWith('Unhandled rejection')
    expect(logger.error).toHaveBeenCalledWith(error)
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
