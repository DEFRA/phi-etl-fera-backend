// updateDbPestHandler.test.js
import { createLogger } from '~/src/helpers/logging/logger'
import {
  updateDbPestHandler,
  preparePestDetails,
  getPestList
} from './update-db-pest'
import { pestNames } from './mocks/pest_names'

// Mock dependencies
// jest.mock('~/src/helpers/logging/logger', () => ({
//   createLogger: jest.fn()
// }))
jest.mock('~/src/helpers/logging/logger')

jest.mock('~/src/helpers/db/create-ds-indexes', () => ({
  createMongoDBIndexes: jest.fn()
}))

// const logger = {
//   info: jest.fn(),
//   error: jest.fn()
// }
// createLogger.mockReturnValue(logger)

describe('updateDbPestHandler', () => {
  let mockLogger, mockResponse
  let db

  beforeAll(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }
    createLogger.mockReturnValue(mockLogger)

    db = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([]),
      listCollections: jest.fn().mockReturnThis(),
      drop: jest.fn()
    }
  })

  beforeEach(() => {
    mockResponse = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with error message when loadData fails', async () => {
    // loadData.mockReturnValue()

    const request = {
      server: {
        db: {}
      }
    }

    await updateDbPestHandler(request, mockResponse)
    expect(mockResponse.code).toHaveBeenCalledWith(500)
  })

  it('should build a pest list', async () => {
    db.listCollections().toArray.mockResolvedValue([])

    const pestListMock = pestNames
    const resultList = preparePestDetails(pestListMock)

    expect(resultList.length).toEqual(4)
  })

  it('should get pest list', async () => {
    const mockPestNameCollection = [
      {
        PEST_NAME: [
          { PEST_NAME: 'Mock Pest Name 1' },
          { PEST_NAME: 'Mock Pest Name 2' }
        ]
      },
      {}
    ]
    db = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(mockPestNameCollection),
      listCollections: jest.fn().mockReturnThis(),
      drop: jest.fn()
    }
    const resultList = getPestList(db)
    // eslint-disable-next-line jest/valid-expect-in-promise
    resultList.then((pest) => expect(pest?.length).toEqual(2))
  })
})
