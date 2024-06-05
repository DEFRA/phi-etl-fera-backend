import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'

const logger = createLogger()

async function connectToMongo(collectionName) {
  // initate mongodb connection to query it
  logger.info(`Initiate mongodb connection for: ${collectionName}`)
  const mongoUri = config.get('mongoUri')
  const databaseName = config.get('mongoDatabase')
  const client = new MongoClient(mongoUri.toString(), {})

  // Connect to MongoDB
  try {
    await client.connect()
    const db = client.db(databaseName)
    logger.info(`Connected to mongodb, fetching : ${collectionName}`)

    const collection = await db.collection(collectionName)
    return collection
  } catch (error) {
    logger.info(`Collection could not be fetched ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}
async function searchPlantDetailsDb(searchText) {
  // const searchText = searchInput
  const results = []
  try {
    let query = {}
    // TODO: Collection name to be read from config file
    const collectionPlant = await connectToMongo('PLANT_DATA')

    if (searchText) {
      // The structure of the results will be the same for each match, the frontend will
      // use the fields that it needs, and ignore the rest
      // If optimisation is required, the result-set will be fine tuned.

      logger.info(`input text is ${searchText}`)
      query = {
        PLANT_NAME: {
          $elemMatch: { type: 'LATIN_NAME', NAME: new RegExp(searchText, 'i') }
        }
      }
      logger.info(query)
      const latinNameResults = await collectionPlant.find(query).toArray()

      if (latinNameResults) {
        results.push({ id: 'latin-name', results: latinNameResults })
      }

      query = {
        PLANT_NAME: {
          $elemMatch: {
            type: 'COMMON_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        }
      }
      const commonNameResults = await collectionPlant.find(query).toArray()

      if (commonNameResults) {
        results.push({ id: 'common-name', results: commonNameResults })
      }

      query = {
        PLANT_NAME: {
          $elemMatch: {
            type: 'SYNONYM_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        }
      }
      const synonymResults = await collectionPlant.find(query).toArray()

      if (synonymResults) {
        results.push({ id: 'synonym-name', results: synonymResults })
      }
    }
    return results
  } catch (error) {
    logger.info(`Search query failed ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

async function getCountries() {
  try {
    const collectionCountries = await connectToMongo('COUNTRIES')

    // Find the document containing the COUNTRY_GROUPING array
    const result = await collectionCountries.find({}).toArray()
    return result
  } catch (error) {
    logger.info(`Countries could not be fetched ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

module.exports = { searchPlantDetailsDb, getCountries }
