// create index on the mongodb collections, if exists
async function createMongoDBIndexes(collection, logger) {
  try {
    const indexHostRef = await collection.createIndex({ HOST_REF: 1 })
    const indexPlantName = await collection.createIndex({
      'PLANT_NAME.NAME': 1
    }) // 1 for ascending, -1 for descending
    logger.info(`Index created: ${indexHostRef}`)
    logger.info(`Index created: ${indexPlantName}`)
  } catch (error) {
    logger?.error('Could not create MongoDB indexes', error)
  }
}

export { createMongoDBIndexes }
