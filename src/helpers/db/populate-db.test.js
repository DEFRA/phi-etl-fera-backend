import {
  populateDbHandler,
  loadData,
  readJsonFile,
  loadCombinedDataForPlant
} from './populate-db'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'

jest.mock('~/src/helpers/logging/logger')
jest.mock('mongodb')
jest.mock('fs/promises')
jest.mock('path', () => ({
  join: jest.fn()
}))

jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn()
}))

describe('populateDbHandler', () => {
  let mockClient

  beforeEach(() => {
    mockClient = {
      connect: jest.fn(),
      close: jest.fn()
    }

    MongoClient.mockReturnValue(mockClient)

    fs.readFile.mockResolvedValue(
      JSON.stringify({ PLANT_NAME: [], PLANT_PEST_LINK: [] })
    )
    path.join.mockImplementation((...args) => args.join('/'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load data into MongoDB collections and start the server', async () => {
    const request = {
      server: {
        db: {
          collection: jest.fn().mockReturnThis(),
          dropCollection: jest.fn(),
          listCollections: jest.fn().mockReturnThis(),
          toArray: jest.fn(),
          insertMany: jest.fn(),
          insertOne: jest.fn()
        }
      }
    }

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }
    await populateDbHandler(request, h)
    const filePath = 'path/to/file.json'
    const db = {
      collection: jest.fn().mockReturnThis(),
      dropCollection: jest.fn()
    }
    await loadData(
      filePath,
      'mongodb://localhost:27017',
      db,
      'collectionName',
      1
    )
    expect(fs.readFile).toHaveBeenCalledWith(filePath, 'utf-8')
    expect(db.collection).toHaveBeenCalledWith('collectionName')
  })

  it('should read the file and insert data into the collection', async () => {
    const db = {
      collection: jest.fn().mockReturnThis(),
      dropCollection: jest.fn()
    }
    const filePath = 'path/to/file.json'
    const fileContents = JSON.stringify({ key: 'value' })
    fs.readFile.mockResolvedValue(fileContents)

    await loadData(
      filePath,
      'mongodb://localhost:27017',
      db,
      'collectionName',
      1
    )
    expect(fs.readFile).toHaveBeenCalledWith(filePath, 'utf-8')
    expect(db.collection).toHaveBeenCalledWith('collectionName')
  })

  describe('readJsonFile', () => {
    it('should read and parse JSON file and should read multiple files and insert combined data into the collection', async () => {
      const mockFilePath = 'mock/path/to/file.json'
      const mockData = {
        PLANT_NAME: [],
        PLANT_PEST_LINK: []
      }

      // Mock the fs.readFile implementation
      require('fs/promises').readFile = jest
        .fn()
        .mockResolvedValueOnce(JSON.stringify(mockData))

      const result = await readJsonFile(mockFilePath)
      expect(result).toEqual(mockData)

      const db = {
        collection: jest.fn().mockReturnThis(),
        dropCollection: jest.fn()
      }
      jest.spyOn(fs, 'readFile')
      await loadCombinedDataForPlant(
        'mongodb://localhost:27017',
        db,
        'collectionName'
      )
      expect(db.collection).toHaveBeenCalledWith('collectionName')
    })
  })
})
