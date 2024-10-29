// create index on the mongodb collections, if exists
async function dropMongoDBIndexes(db, collectionName, logger) {
  try {
    const collection = db.collection(collectionName)

    // Fetch existing indexes
    const existingIndexes = await collection.indexes()

    // Drop existing non-default indexes
    for (const index of existingIndexes) {
      if (index.name !== '_id_') {
        // Don't drop the default `_id` index
        await collection.dropIndex(index.name)
        logger?.info(
          `Dropped index: ${index.name} on collection: ${collectionName}`
        )
      }
    }
  } catch (error) {
    logger.error(
      `Error while managing indexes on collection ${collectionName}:`,
      error
    )
  }
}

async function createMongoDBIndexes(db, collectionName, logger, indexes) {
  try {
    const collection = db.collection(collectionName)

    // Create new indexes
    for (const index of indexes) {
      await collection.createIndex(index.key, { name: index.name })
      logger?.info(
        `Created index: ${index.name} on collection: ${collectionName}`
      )
    }
  } catch (error) {
    logger?.error(
      `Error while managing indexes on collection ${collectionName}:`,
      error
    )
  }
}

async function runIndexManagement(db, logger) {
  logger?.info('Index management started')
  try {
    // Define collections and their respective indexes
    const collectionsWithIndexes = [
      {
        name: 'PLANT_ANNEX11',
        indexes: [
          {
            key: { 'PLANT_ANNEX11.HOST_REF': 1 },
            name: 'index_on_PLANT_ANNEX11_HOST_REF'
          }
        ]
      },
      {
        name: 'PLANT_ANNEX6',
        indexes: [
          { key: { HOST_REF: 1 }, name: 'index_on_PLANT_ANNEX6_HOST_REF' }
        ]
      },
      {
        name: 'PLANT_NAME',
        indexes: [
          { key: { HOST_REF: 1 }, name: 'index_on_PLANT_NAME_HOST_REF' }
        ]
      },
      {
        name: 'PLANT_PEST_LINK',
        indexes: [
          { key: { HOST_REF: 1 }, name: 'index_on_PLANT_PEST_LINK_HOST_REF' }
        ]
      },
      {
        name: 'PLANT_PEST_LINK',
        indexes: [
          { key: { HOST_REF: 1 }, name: 'index_on_PLANT_PEST_LINK_HOST_REF' }
        ]
      },
      {
        name: 'PEST_PLANT_LINK',
        indexes: [
          {
            key: { HOST_REF: 1, CSL_REF: -1 },
            name: 'index_on_PEST_PLANT_LINK_HOST_REF_CSL_REF'
          }
        ]
      },
      {
        name: 'PEST_NAME',
        indexes: [
          {
            key: { 'PEST_NAME.CSL_REF': 1 },
            name: 'index_on_PEST_NAME_CSL_REF'
          }
        ]
      },
      {
        name: 'PEST_DATA',
        indexes: [{ key: { CSL_REF: 1 }, name: 'index_on_PEST_DATA_CSL_REF' }]
      },
      {
        name: 'PLANT_DATA',
        indexes: [
          {
            key: { HOST_REF: 1, PARENT_HOST_REF: 1 },
            name: 'index_on_PLANT_DATA_HF_PHF'
          }
        ]
      },
      {
        name: 'PLANT_DATA',
        indexes: [
          {
            key: { 'PLANT_NAME.NAME': 1, 'PLANT_NAME.type': 1 },
            name: 'index_on_PLANT_DATA_NAME_TYPE'
          }
        ]
      },
      {
        name: 'PLANT_DATA',
        indexes: [
          {
            key: { 'PEST_LINK.CSL_REF': 1, 'PEST_LINK.EPPO_CODE': 1 },
            name: 'index_on_PLANT_DATA_PL_EPPO'
          }
        ]
      },
      {
        name: 'PLANT_DATA',
        indexes: [
          {
            key: {
              'HOST_REGULATION.ANNEX6.HOST_REF': 1,
              'HOST_REGULATION.ANNEX6.PARENT_HOST_REF': 1,
              'HOST_REGULATION.ANNEX6.GRAND_PARENT_HOST_REF': 1
            },
            name: 'index_on_PLANT_DATA_ANNEX6'
          }
        ]
      },
      {
        name: 'PLANT_DATA',
        indexes: [
          {
            key: { 'HOST_REGULATION.ANNEX11.HOST_REF': 1 },
            name: 'index_on_PLANT_DATA_ANNEX11'
          }
        ]
      }
    ]

    for (const { name } of collectionsWithIndexes) {
      await dropMongoDBIndexes(db, name, logger)
    }

    // Loop through each collection and manage indexes
    for (const { name, indexes } of collectionsWithIndexes) {
      await createMongoDBIndexes(db, name, logger, indexes)
    }

    logger?.info('Index management completed successfully')
  } catch (error) {
    logger?.error('Error during the index management process:', error)
  }
}

export { runIndexManagement, createMongoDBIndexes }
