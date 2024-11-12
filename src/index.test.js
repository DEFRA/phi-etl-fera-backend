import { config } from '~/src/config'
import { createServer } from '~/src/api/server'
import { createLogger } from '~/src/helpers/logging/logger'
import { startServer } from './index'

jest.mock('~/src/config')
jest.mock('~/src/api/server')
jest.mock('~/src/helpers/logging/logger')

const logger = {
  info: jest.fn(),
  error: jest.fn()
}
createLogger.mockReturnValue(logger)

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
})
