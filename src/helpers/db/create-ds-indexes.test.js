// tests/createMongoDBIndexes.test.js

import { createMongoDBIndexes } from './create-ds-indexes'

describe('createMongoDBIndexes', () => {
  let db
  let collection
  let logger

  beforeEach(() => {
    collection = {
      indexes: jest.fn(),
      dropIndex: jest.fn(),
      createIndex: jest.fn()
    }
    db = {
      collection: jest.fn(() => collection)
    }
    logger = {
      info: jest.fn(),
      error: jest.fn()
    }
  })

  it('should drop existing non-default indexes and create new indexes', async () => {
    const existingIndexes = [
      { name: '_id_' },
      { name: 'old_index_1' },
      { name: 'old_index_2' }
    ]
    const newIndexes = [
      { key: { field1: 1 }, name: 'new_index_1' },
      { key: { field2: -1 }, name: 'new_index_2' }
    ]

    collection.indexes.mockResolvedValue(existingIndexes)

    await createMongoDBIndexes(db, 'testCollection', logger, newIndexes)

    expect(collection.indexes).toHaveBeenCalled()
    expect(collection.dropIndex).toHaveBeenCalledWith('old_index_1')
    expect(collection.dropIndex).toHaveBeenCalledWith('old_index_2')
    expect(collection.createIndex).toHaveBeenCalledWith(
      { field1: 1 },
      { name: 'new_index_1' }
    )
    expect(collection.createIndex).toHaveBeenCalledWith(
      { field2: -1 },
      { name: 'new_index_2' }
    )
    expect(logger.info).toHaveBeenCalledWith(
      'Dropped index: old_index_1 on collection: testCollection'
    )
    expect(logger.info).toHaveBeenCalledWith(
      'Dropped index: old_index_2 on collection: testCollection'
    )
    expect(logger.info).toHaveBeenCalledWith(
      'Created index: new_index_1 on collection: testCollection'
    )
    expect(logger.info).toHaveBeenCalledWith(
      'Created index: new_index_2 on collection: testCollection'
    )
  })

  it('should log an error if an exception occurs', async () => {
    const error = new Error('Test error')
    collection.indexes.mockRejectedValue(error)

    await createMongoDBIndexes(db, 'testCollection', logger, [])

    expect(logger.error).toHaveBeenCalledWith(
      'Error while managing indexes on collection testCollection:',
      error
    )
  })
})
