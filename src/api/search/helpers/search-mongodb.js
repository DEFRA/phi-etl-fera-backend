import { config } from '~/src/config'
import { MongoClient } from 'mongodb'

import { createLogger } from '~/src/helpers/logging/logger'
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
      logger.info(`input text is ${searchText}`)
      query = {
        PLANT_NAME: {
          $elemMatch: { type: 'LATIN_NAME', NAME: new RegExp(searchText, 'i') }
        },
        LEVEL_OF_TAXONOMY: 'S'
      }

      logger.info(query)
      const latinNameResults = await collectionPlant.find(query).toArray()

      if (latinNameResults) {
        const latinArr = []
        // filter latinNameResults and get rid of uncesseary fields
        latinNameResults.map((item) => {
          latinArr.push({
            plantName: item.PLANT_NAME,
            hostRef: item.HOST_REF,
            eppoCode: item.EPPO_CODE
          })
          return latinArr
        })
        results.push({ id: 'latin-name', results: latinArr })
      }

      query = {
        PLANT_NAME: {
          $elemMatch: {
            type: 'COMMON_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        },
        LEVEL_OF_TAXONOMY: 'S'
      }
      const commonNameResults = await collectionPlant.find(query).toArray()

      if (commonNameResults) {
        const commonArr = []
        // filter commonNameResults and get rid of uncesseary fields
        commonNameResults.map((item) => {
          commonArr.push({
            plantName: item.PLANT_NAME,
            hostRef: item.HOST_REF,
            eppoCode: item.EPPO_CODE
          })
          return commonArr
        })
        results.push({ id: 'common-name', results: commonArr })
      }

      query = {
        PLANT_NAME: {
          $elemMatch: {
            type: 'SYNONYM_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        },
        LEVEL_OF_TAXONOMY: 'S'
      }
      const synonymResults = await collectionPlant.find(query).toArray()
      if (synonymResults) {
        const synonymArr = []
        // filter synonymResults and get rid of uncesseary fields
        synonymResults.map((item) => {
          synonymArr.push({
            plantName: item.PLANT_NAME,
            hostRef: item.HOST_REF,
            eppoCode: item.EPPO_CODE
          })
          return synonymArr
        })
        results.push({ id: 'synonym-name', results: synonymArr })
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
async function searchPestDetailsDb(searchText) {
  // const searchText = searchInput
  const results = []
  try {
    let query = {}
    // TODO: Collection name to be read from config file
    const collectionPest = await connectToMongo('PEST_DATA')

    if (searchText) {
      logger.info(`input text is ${searchText}`)
      query = {
        PEST_NAME: {
          $elemMatch: { type: 'LATIN_NAME', NAME: new RegExp(searchText, 'i') }
        }
      }

      const latinNameResults = await collectionPest.find(query).toArray()

      if (latinNameResults) {
        const latinArr = []
        // filter latinNameResults and get rid of uncesseary fields
        latinNameResults.map((item) => {
          latinArr.push({
            pestName: item.PEST_NAME,
            cslRef: item.CSL_REF,
            eppoCode: item.EPPO_CODE
          })
          return latinArr
        })
        results.push({ id: 'latin-name', results: latinArr })
      }

      query = {
        PEST_NAME: {
          $elemMatch: {
            type: 'COMMON_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        }
      }
      const commonNameResults = await collectionPest.find(query).toArray()

      if (commonNameResults) {
        const commonArr = []
        // filter commonNameResults and get rid of uncesseary fields
        commonNameResults.map((item) => {
          commonArr.push({
            pestName: item.PEST_NAME,
            cslRef: item.CSL_REF,
            eppoCode: item.EPPO_CODE
          })
          return commonArr
        })
        results.push({ id: 'common-name', results: commonArr })
      }

      query = {
        PEST_NAME: {
          $elemMatch: {
            type: 'SYNONYM_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        }
      }
      const synonymResults = await collectionPest.find(query).toArray()
      if (synonymResults) {
        const synonymArr = []
        // filter synonymResults and get rid of uncesseary fields
        synonymResults.map((item) => {
          synonymArr.push({
            pestName: item.PEST_NAME,
            cslRef: item.CSL_REF,
            eppoCode: item.EPPO_CODE
          })
          return synonymArr
        })
        results.push({ id: 'synonym-name', results: synonymArr })
      }
    }

    return results
  } catch (error) {
    logger.info(`Search query failed ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}
async function getpestDetails(cslref) {
  try {
    const collectionPestDetails = await connectToMongo('PEST_DATA')
    // Find the document containing the COUNTRY_GROUPING array
    const result = await collectionPestDetails
      .find({ CSL_REF: cslref })
      .toArray()
    return result
  } catch (error) {
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

module.exports = {
  searchPlantDetailsDb,
  getCountries,
  searchPestDetailsDb,
  getpestDetails
}
