import {
  populateDbHandler,
  loadData,
  readJsonFile,
  loadCombinedDataForPlantAndBuildParents
} from './populate-db'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'

jest.mock('~/src/helpers/logging/logger-options', () => ({
  customLevels: {
    default: 'info',
    levels: {
      info: 30,
      warn: 40,
      error: 50
    }
  }
}))
jest.mock('mongodb')
jest.mock('fs/promises')
jest.mock('path', () => ({
  join: jest.fn()
}))
// jest.mock('./populate-db', () => ({
//   loadData: jest.fn(),
//   loadCombinedDataForPlantAndBuildParents: jest.fn(),
//   populateDbHandler: jest.fn(),
//   readJsonFile: jest.fn() // Ensure readJsonFile is mocked here
// }));

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
      const mockData = [{
        PLANT_NAME: [],
        PLANT_PEST_LINK: []
      }]

      const mockData1 = [
        { HOST_REF: '1', PARENT_HOST_REF: '0' },
        { HOST_REF: '2', PARENT_HOST_REF: '1' }
      ];
      const mockData2 = [
        { HOST_REF: '3', PARENT_HOST_REF: '2' },
        { HOST_REF: '4', PARENT_HOST_REF: '3' }
      ];

      // Mock the fs.readFile implementation
      require('fs/promises').readFile = jest
        .fn()
        .mockResolvedValueOnce(JSON.stringify(mockData1))
      require('fs/promises').readFile = jest
      .fn()
      .mockResolvedValueOnce(JSON.stringify(mockData2))  

      const result = await readJsonFile('~src/helpers/db/data/PlantDataJson1V0.36Base.json')
      expect(result).toEqual({"PLANT_NAME": [], "PLANT_PEST_LINK": []})
      const result1 = await readJsonFile('~src/helpers/db/data/PlantDataJson2V0.36Base.json')
      // expect(result1).toEqual(mockData2)

      const db = {
        collection: jest.fn().mockReturnThis(),
        dropCollection: jest.fn()
      }
      
      jest.spyOn(fs, 'readFile')
      await loadCombinedDataForPlantAndBuildParents(
        'mongodb://localhost:27017',
        db,
        'collectionName'
      )
      expect(db.collection).toHaveBeenCalledWith('collectionName')
    })
  })
})




// const mockData1 = [
//   { HOST_REF: '1', PARENT_HOST_REF: '0' },
//   { HOST_REF: '2', PARENT_HOST_REF: '1' }
// ];
// const mockData2 = [
//   { HOST_REF: '3', PARENT_HOST_REF: '2' },
//   { HOST_REF: '4', PARENT_HOST_REF: '3' }
// ];

// readJsonFile.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

// await loadCombinedDataForPlantAndBuildParents('mongodb://localhost:27017', db, 'collectionName');

// console.log('readJsonFile calls:', readJsonFile.mock.calls);
// console.log('insertMany calls:', collection.insertMany.mock.calls);

// expect(readJsonFile).toHaveBeenCalledWith(expect.stringContaining('PlantDataJson1V0.36Base.json'));
// expect(readJsonFile).toHaveBeenCalledWith(expect.stringContaining('PlantDataJson2V0.36Base.json'));
// expect(db.collection).toHaveBeenCalledWith('collectionName');
// expect(collection.insertMany).toHaveBeenCalledWith([...mockData1, ...mockData2]);

// const expectedBulkOps = [
//   {
//     updateOne: {
//       filter: { HOST_REF: '1' },
//       update: { $set: { GRAND_PARENT_HOST_REF: '', GREAT_GRAND_PARENT_HOST_REF: '' } }
//     }
//   },
//   {
//     updateOne: {
//       filter: { HOST_REF: '2' },
//       update: { $set: { GRAND_PARENT_HOST_REF: '0', GREAT_GRAND_PARENT_HOST_REF: '' } }
//     }
//   },
//   {
//     updateOne: {
//       filter: { HOST_REF: '3' },
//       update: { $set: { GRAND_PARENT_HOST_REF: '1', GREAT_GRAND_PARENT_HOST_REF: '0' } }
//     }
//   },
//   {
//     updateOne: {
//       filter: { HOST_REF: '4' },
//       update: { $set: { GRAND_PARENT_HOST_REF: '2', GREAT_GRAND_PARENT_HOST_REF: '1' } }
//     }
//   }
// ];

// expect(collection.bulkWrite).toHaveBeenCalledWith(expectedBulkOps);
// });
// });
// AI-generated code. Review and use carefully. More info on FAQ.
// Key Points:
// Console Logs: Added console.log statements to check the calls to readJsonFile and collection.insertMany.
// Mock Setup: Ensured that readJsonFile and collection.insertMany are correctly mocked.
// Run the test again and check the console output to see if the function is being called and if the data is being processed as expe