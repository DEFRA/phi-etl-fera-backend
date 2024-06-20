import { populateDbHandler } from '~/src/helpers/db/populate-db'
import { updateDbPestHandler } from '~/src/helpers/db/update-db-pest'
import { updateDbPlantHandler } from '~/src/helpers/db/update-db-plant'

const etl = {
  plugin: {
    name: 'etl',
    register: async function (server, options) {
      server.route([
        {
          method: 'GET',
          path: '/populateDb',
          handler: populateDbHandler
        },
        {
          method: 'GET',
          path: '/updatePest',
          handler: updateDbPestHandler
        },
        {
          method: 'GET',
          path: '/updatePlant',
          ...updateDbPlantHandler
        }
      ])
    }
  }
}

export { etl }
