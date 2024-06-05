import { search } from '~/src/api/search'
import { workflow } from '~/src/api/workflow'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([search, workflow])
    }
  }
}

export { router }
