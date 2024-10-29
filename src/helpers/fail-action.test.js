import { failAction } from '~/src/helpers/fail-action'

describe('failAction', () => {
  let request
  let h
  let error

  beforeEach(() => {
    request = {
      logger: {
        error: jest.fn()
      }
    }
    h = {} // h is not used in this function, but included for completeness
    error = new Error('Test error')
  })

  it('should log the error and throw it', () => {
    expect(() => failAction(request, h, error)).toThrow(error)
    expect(request.logger.error).toHaveBeenCalledWith(error, error.message)
  })
})
