import {
  dropMongoDBIndexes,
  createMongoDBIndexes,
  runIndexManagement
} from './create-ds-indexes' // Adjust the path to your module

describe('MongoDB Index Management', () => {
  let db
  let logger
  let collection

  beforeEach(() => {
    collection = {
      indexes: jest.fn(),
      dropIndex: jest.fn(),
      createIndex: jest.fn()
    }
    db = {
      collection: jest.fn().mockReturnValue(collection)
    }
    logger = {
      info: jest.fn(),
      error: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('dropMongoDBIndexes', () => {
    it('should drop non-default indexes', async () => {
      collection.indexes.mockResolvedValue([
        { name: '_id_' },
        { name: 'index1' }
      ])

      await dropMongoDBIndexes(db, 'testCollection', logger)

      expect(collection.indexes).toHaveBeenCalled()
      expect(collection.dropIndex).toHaveBeenCalledWith('index1')
      expect(logger.info).toHaveBeenCalledWith(
        'Dropped index: index1 on collection: testCollection'
      )
    })

    it('should handle errors', async () => {
      const error = new Error('Test error')
      collection.indexes.mockRejectedValue(error)

      await dropMongoDBIndexes(db, '', logger)

      expect(logger.error).toHaveBeenCalledWith(
        'Error while managing indexes on collection :',
        error
      )
    })
  })

  describe('createMongoDBIndexes', () => {
    it('should create indexes', async () => {
      const indexes = [{ key: { field1: 1 }, name: 'index1' }]

      await createMongoDBIndexes(db, 'testCollection', logger, indexes)

      expect(collection.createIndex).toHaveBeenCalledWith(
        { field1: 1 },
        { name: 'index1' }
      )
      expect(logger.info).toHaveBeenCalledWith(
        'Created index: index1 on collection: testCollection'
      )
    })

    it('should handle errors', async () => {
      const error = new Error('db.collection is not a function')
      collection.createIndex.mockRejectedValue(error)
      collection.indexes.mockRejectedValue(error)

      await createMongoDBIndexes('', '', logger, [])

      expect(logger.error).toHaveBeenCalledWith(
        'Error while managing indexes on collection :',
        error
      )
    })
  })

  describe('runIndexManagement', () => {
    it('should manage indexes for all collections', async () => {
      await runIndexManagement(db, logger)
      expect(logger.info).toHaveBeenCalledWith('Index management started')
      expect(logger.info).toHaveBeenCalledWith(
        'Index management completed successfully'
      )
    })

    it('should handle errors during index management', async () => {
      const error = new Error('Test error')
      collection.indexes.mockRejectedValue(error)

      await runIndexManagement(db, logger)

      expect(logger.error).toHaveBeenCalledWith(
        'Error while managing indexes on collection PLANT_ANNEX11:',
        error
      )
      expect(logger.error).toHaveBeenCalledWith(
        'Error while managing indexes on collection PLANT_ANNEX6:',
        error
      )
      expect(logger.error).toHaveBeenCalledWith(
        'Error while managing indexes on collection PLANT_NAME:',
        error
      )
    })
  })
})
