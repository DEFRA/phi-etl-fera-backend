import { pestdetailsController } from '~/src/api/search/pestdetails-controller'
import { getpestDetails } from '~/src/api/search/helpers/search-mongodb'

jest.mock('~/src/api/search/helpers/search-mongodb')

describe('pestdetailsController', () => {
  let request
  let h

  beforeEach(() => {
    request = {
      payload: { pestDetails: { cslRef: '123' } },
      db: {},
      logger: { error: jest.fn() }
    }

    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }
  })

  it('should return pest details with status 200', async () => {
    const mockResult = { name: 'PestName', details: 'Some details' }
    getpestDetails.mockResolvedValue(mockResult)

    await pestdetailsController.handler(request, h)

    expect(getpestDetails).toHaveBeenCalledWith(
      request.db,
      '123',
      request.logger
    )
    expect(h.response).toHaveBeenCalledWith({ pest_detail: mockResult })
    expect(h.code).toHaveBeenCalledWith(200)
  })

  it('should handle errors and return status 500', async () => {
    const mockError = new Error('Database error')
    getpestDetails.mockRejectedValue(mockError)

    await pestdetailsController.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({ error: mockError.message })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
