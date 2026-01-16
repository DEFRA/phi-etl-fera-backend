import { updateDbPestHandler, loadData, setIsLocked } from './update-db-pest'
import { createLogger } from '~/src/helpers/logging/logger'

jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn()
}))

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
  let logger

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn()
    }
    createLogger.mockReturnValue(logger)
    request = {
      server: {
        db: {
          collection: jest.fn().mockReturnValue({
            insertMany: jest.fn(),
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  PEST_NAME: [],
                  PLANT_PEST_REG: [],
                  PEST_PRA_DATA: [],
                  PEST_DOCUMENT_FCPD: [],
                  PEST_DISTRIBUTION: []
                }
              ])
            })
          }),
          dropCollection: jest.fn(),
          listCollections: jest.fn().mockReturnThis({ name: 'PEST_DATA' }),
          toArray: jest.fn(),
          insertMany: jest.fn(),
          insertOne: jest.fn(),
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        }
      }
    }
    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }

    jest.clearAllMocks()
  })

  it('should return 429 if already locked', async () => {
    setIsLocked(true)
    await updateDbPestHandler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      status: 'Info',
      message:
        '/udpatePest load in progress, please try again later if required.'
    })
    expect(h.code).toHaveBeenCalledWith(429)
  })

  it('should call loadData and return success response', async () => {
    setIsLocked(false)
    loadData.mockResolvedValue()
    await loadData(request.server.db)
    await updateDbPestHandler(request, h)

    expect(loadData).toHaveBeenCalledWith(request.server.db)
    expect(h.response).toHaveBeenCalledWith({
      status: 'success',
      message: 'Update Pest Db successful'
    })
    expect(h.code).not.toHaveBeenCalled()
  })

  it('should handle errors and return error response', async () => {
    const error = new Error('Test error')
    request = {
      server: {
        db: {
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  PEST_NAME: [],
                  PLANT_PEST_REG: [],
                  PEST_PRA_DATA: [],
                  PEST_DOCUMENT_FCPD: [],
                  PEST_DISTRIBUTION: []
                }
              ])
            })
          }),
          dropCollection: jest.fn(),
          listCollections: jest.fn().mockReturnThis({ name: 'PEST_DATA' }),
          toArray: jest.fn(),
          insertMany: jest.fn(),
          insertOne: jest.fn(),
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        }
      }
    }
    await loadData.mockRejectedValue(error)
    await updateDbPestHandler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      status: 'error',
      message: 'collection.insertMany is not a function'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
