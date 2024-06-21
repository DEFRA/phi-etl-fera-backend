import { etl } from './index' // Adjust the import path as necessary
import { populateDbHandler } from '~/src/helpers/db/populate-db'
import { updateDbPestHandler } from '~/src/helpers/db/update-db-pest'
import { updateDbPlantHandler } from '~/src/helpers/db/update-db-plant'

// Mock the handlers
jest.mock('~/src/helpers/db/populate-db', () => ({
  populateDbHandler: jest.fn()
}))

jest.mock('~/src/helpers/db/update-db-pest', () => ({
  updateDbPestHandler: jest.fn()
}))

jest.mock('~/src/helpers/db/update-db-plant', () => ({
  updateDbPlantHandler: jest.fn()
}))

describe('etl plugin', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  it('should register the correct routes', async () => {
    await etl.plugin.register(server, {})

    expect(server.route).toHaveBeenCalledWith([
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
  })
})
