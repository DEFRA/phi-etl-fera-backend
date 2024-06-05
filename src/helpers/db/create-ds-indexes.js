import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

// create index on the mongodb collections, if exists
async function createMongoDBIndexes(db) {
  const collections = await db.listCollections().toArray()
  try {
    collections?.forEach(async (collectionInfo) => {
      // TODO: Check when and how often Index need to be create/refreshed
      // Check for Plant_Detail collection
      // if (collectionInfo.name === 'PLANT_DETAIL') {
      // const collection = db.collection(collectionInfo.name)
      // Create an index on the specified field
      // TODO: CREATE INDEX IS THROWING MONGODB EXECPTION. COMMENTING IT TO LOAD
      // THE LATEST RECORDS. INDEXS ARE REQUIRED ON DB, THIS ISSUE NEED TO BE LOOKED
      // INTO AND RESOLVED.
      // await collection.createIndex({ LATIN_NAME: 1 })
      // TODO: Create Index on multiple fields (if required)
      // }
    })
  } catch (error) {
    logger.error('Could not create MongoDB indexes', error)
  }
}

export { createMongoDBIndexes }
