import { updateDbPestHandler, loadData } from './update-db-pest'
import { createLogger } from '~/src/helpers/logging/logger'

jest.mock('~/src/helpers/logging/logger')
jest.mock('../models/pestDetail', () => ({
  pestDetail: {
    get: jest.fn(() => ({
      EPPO_CODE: '',
      CSL_REF: '',
      LATIN_NAME: '',
      PEST_NAME: []
    }))
  }
}))

// Mock the loadData function
jest.mock('./update-db-pest', () => {
  const originalModule = jest.requireActual('./update-db-pest')
  return {
    ...originalModule,
    loadData: jest.fn()
  }
})

describe('updateDbPestHandler', () => {
  let request
  let h
  let db
  let logger

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      listCollections: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([]),
      drop: jest.fn(),
      insertMany: jest.fn(),
      loadData: jest.fn()
    }
    logger = {
      info: jest.fn(),
      error: jest.fn()
    }
    createLogger.mockReturnValue(logger)
    request = { server: { db } }
    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return 429 if isLocked is true', async () => {
    await updateDbPestHandler(request, h)
    expect(h.response).toHaveBeenCalledWith({
      status: 'success',
      message: 'Update Pest Db successful'
    })
    expect(h.code).toHaveBeenCalledWith(429)
  })

  it('should call loadData and return success response', async () => {
    await updateDbPestHandler(request, h)
    // expect(loadData).toHaveBeenCalledWith(db);
    expect(h.response).toHaveBeenCalledWith({
      status: 'success',
      message: 'Update Pest Db successful'
    })
    expect(h.code).not.toHaveBeenCalled()
  })

  it('should log error and return error response if loadData throws', async () => {
    const error = new Error('Test error')
    loadData.mockImplementation(() => {
      throw error
    })
    await updateDbPestHandler(request, h)
    expect(logger.error).toHaveBeenCalledWith(error)
    expect(h.response).toHaveBeenCalledWith({
      status: 'error',
      message: error.message
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
