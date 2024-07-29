import { countryController } from './country-controller'
import { getCountries } from '~/src/api/search/helpers/search-mongodb'
import { createLogger } from '~/src/helpers/logging/logger'

// Mock the dependencies
jest.mock('~/src/api/search/helpers/search-mongodb')
jest.mock('~/src/helpers/logging/logger')

describe('countryController handler', () => {
  let mockResponse, h

  beforeEach(() => {
    mockResponse = jest.fn(() => ({
      code: jest.fn().mockReturnThis()
    }))
    h = {
      response: mockResponse
    }
    createLogger.mockReturnValue({
      error: jest.fn()
    })
  })

  it('should return 200 and countries list on successful getCountries call', async () => {
    const mockCountries = ['Country1', 'Country2']
    getCountries.mockResolvedValue(mockCountries)

    await countryController.handler({}, h)

    expect(getCountries).toHaveBeenCalled()
    expect(h.response).toHaveBeenCalledWith({ countries: mockCountries })
  })

  it('should return 500 and error message on getCountries failure', async () => {
    const mockError = new Error()
    getCountries.mockRejectedValue(mockError)

    await countryController.handler({}, h)

    //expect(getCountries).not.toHaveBeenCalled(null)
    expect(h.response).toHaveBeenCalledWith({ error: mockError.message })
  })
})
