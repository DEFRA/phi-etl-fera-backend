import { feraAPIController } from '~/src/api/fera/feraAPIController'

const fera = {
  plugin: {
    name: 'fera',
    register: async function (server, options) {
      server.route([
        {
          method: 'GET',
          path: '/invokeFeraApis',
          ...feraAPIController
        }
      ])
    }
  }
}

export { fera }
