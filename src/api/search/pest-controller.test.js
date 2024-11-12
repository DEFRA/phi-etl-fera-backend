import { pestController } from './pest-controller'
import { searchPestDetailsDb } from '~/src/api/search/helpers/search-mongodb'
jest.mock('~/src/api/search/helpers/search-mongodb')

describe('pestController', () => {
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

  it('should return pest details with status 200', async () => {
    const mockResult = { name: 'rose', type: 'flower' }
    searchPestDetailsDb.mockResolvedValue(mockResult)
    await pestController.handler(request, h)

    expect(searchPestDetailsDb).toHaveBeenCalledWith(
      request.db,
      'rose',
      request.logger
    )
    expect(h.response).toHaveBeenCalledWith({ pest_detail: mockResult })
    expect(h.code).toHaveBeenCalledWith(200)
  })

  it('should handle errors and return status 500', async () => {
    const mockError = new Error('Pest search did not yeild results')
    searchPestDetailsDb.mockRejectedValue(mockError)

    await pestController.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Pest search did not yeild results'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
