import { config } from '~/src/config'
import { MongoClient } from 'mongodb'


let logger = ''

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
async function searchPlantDetailsDb(searchText, cdpLogger) {
  logger = cdpLogger
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

async function getCountries(cdpLogger) {
  try {
    logger = cdpLogger
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
async function searchPestDetailsDb(searchText, cdpLogger) {
  logger = cdpLogger
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
      // logger.info(latinNameResults)
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
      // logger.info('latinarra',latinArr)
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
async function getpestDetails(cslref, cdpLogger) {
  try {
    logger = cdpLogger

    const collectionPestDetails = await connectToMongo('PEST_DATA')

    // Find the document containing the COUNTRY_GROUPING array
    const result = await collectionPestDetails
      .find({ CSL_REF: cslref })
      .toArray()

    return result
  } catch (error) {
    logger.info(`Countries could not be fetched ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}
async function getpestplantLink(hostref, cdpLogger) {
  try {
    logger = cdpLogger
// const objids=hostref.map(id => ObjectId(id) )
//     const collectionPlantDetails = await connectToMongo('PLANT_DATA')
// console.log("comes i nside plantlink",objids)


//     // Find the document containing the COUNTRY_GROUPING array
//     const result = await collectionPlantDetails
//       .find({ HOST_REF: { $in: [ objids ] } })
     
//       .toArray()
      console.log("result of plantlink",result);

    return result
  } catch (error) {
    logger.info(`Countries could not be fetched ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }

}



// const express = require('express'); const bodyParser = require('body-parser'); const axios = require('axios'); const app = express(); const PORT = 3000;
// // Middleware to parse JSON bodiesapp.use(bodyParser.json());
// // API endpoint to receive data 
// app.post('/api/endpoint', (req, res) => {
//   const dataArray = req.body.data;
//   console.log('Received data:', dataArray);
//   // Process the data as needed // ... 
//   res.json({ message: 'Data received successfully!' });
// });
// // Start the server 
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   // Example data array 
//   constdataArray = [{ id: 1, value: 'A' }, { id: 2, value: 'B' }, { id: 3, value: 'C' }];
//   // Function to send an array of data in a single API call 
//   async function sendArrayData(dataArray) {
//     try {
//       const response = awaitaxios.post('http://localhost:3000/api/endpoint',
//         { data: dataArray }); console.log('Response:', response.data);
//     }
//     catch (error) { console.error('Error:', error); }
//   }
//   // Call the function with the example data array 
//   sendArrayData(dataArray);
// });

module.exports = {
  searchPlantDetailsDb,
  getCountries,
  searchPestDetailsDb,
  getpestDetails,
  getpestplantLink
}
