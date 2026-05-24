// tests/router.test.js
import { search } from '~/src/api/search'
import { workflow } from '~/src/api/workflow'
import { router } from './router' // Adjust the import according to the actual file location
import { etl } from '~/src/api/etl'
import { fera } from '~/src/api/fera'
import { health } from '~/src/api/health'

jest.mock('~/src/api/search')

describe('router', () => {
  let server

  beforeEach(() => {
    server = {
      register: jest.fn()
    }
  })

  it('should register the search plugin', async () => {
    await router.plugin.register(server)

    expect(server.register).toHaveBeenCalledWith([
      health,
      search,
      workflow,
      etl,
      fera
    ])
  })
})
