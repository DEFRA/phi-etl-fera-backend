import { processHandler } from '~/src/api/workflow/processHandler'

const workflow = {
  plugin: {
    name: 'workflow',
    register: async function (server, options) {
      server.route({
        method: 'POST',
        path: '/workflow',
        handler: processHandler
      })
    }
  }
}

export { workflow }
