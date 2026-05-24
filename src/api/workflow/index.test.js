import { workflow } from '~/src/api/workflow/index'
import { processHandler } from '~/src/api/workflow/processHandler'

describe('Workflow Plugin', () => {
  let serverMock

  beforeEach(() => {
    serverMock = {
      route: jest.fn()
    }
  })

  it('should register the /workflow route', async () => {
    await workflow.plugin.register(serverMock)

    expect(serverMock.route).toHaveBeenCalledWith({
      method: 'POST',
      path: '/workflow',
      handler: processHandler
    })
  })
})
