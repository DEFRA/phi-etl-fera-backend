import { health } from '~/src/api/health/index' // Adjust the import path accordingly
import { healthController } from '~/src/api/health/controller'

describe('Health Plugin', () => {
  let serverMock

  beforeEach(() => {
    serverMock = {
      route: jest.fn()
    }
  })

  it('should register the /health route', async () => {
    await health.plugin.register(serverMock)

    expect(serverMock.route).toHaveBeenCalledWith({
      method: 'GET',
      path: '/health',
      ...healthController
    })
  })
})
