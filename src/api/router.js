import { search } from '~/src/api/search'
import { workflow } from '~/src/api/workflow'
import { etl } from '~/src/api/etl'
import { health } from '~/src/api/health'
import { fera } from '~/src/api/fera'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, search, workflow, etl, fera])
    }
  }
}

export { router }
