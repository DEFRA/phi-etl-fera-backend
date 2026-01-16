import { searchController } from '~/src/api/search/controller.js'
import { searchPlantDetailsDb } from '~/src/api/search/helpers/search-mongodb'

jest.mock('~/src/api/search/helpers/search-mongodb')

describe('searchController', () => {
  let request
  let h

  beforeEach(() => {
    request = {
      payload: { search: 'rose' },
      db: {},
      logger: { error: jest.fn() }
    }

    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }
  })

  it('should return plant details with status 200', async () => {
    const mockResult = { name: 'rose', type: 'flower' }
    searchPlantDetailsDb.mockResolvedValue(mockResult)

    await searchController.handler(request, h)

    expect(searchPlantDetailsDb).toHaveBeenCalledWith(
      request.db,
      'rose',
      request.logger
    )
    expect(h.response).toHaveBeenCalledWith({ plant_detail: mockResult })
    expect(h.code).toHaveBeenCalledWith(200)
  })

  it('should handle errors and return status 500', async () => {
    const mockError = new Error('Database error')
    searchPlantDetailsDb.mockRejectedValue(mockError)

    await searchController.handler(request, h)

    expect(request.logger?.error).toHaveBeenCalledWith(
      'Plant search did not yeild results: Database error'
    )
    expect(h.response).toHaveBeenCalledWith({
      error: 'Plant search did not yeild results'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
