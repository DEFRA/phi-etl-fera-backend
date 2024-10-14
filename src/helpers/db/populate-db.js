import { createLogger } from '~/src/helpers/logging/logger'
import path from 'path'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'

const logger = createLogger()
const filePathPlant = path.join(__dirname, 'data', 'plantsv1.json')
const filePathCountry = path.join(__dirname, 'data', 'countries.json')
const filePathService = path.join(__dirname, 'data', 'serviceFormat.json')
const filePathServiceAnnex6 = path.join(__dirname, 'data', 'plant_annex6.json')
const filePathServiceAnnex11 = path.join(
  __dirname,
  'data',
  'plant_annex11.json'
)
const filePathServicePestName = path.join(__dirname, 'data', 'pest_name.json')

const filePathServicePlantPestReg = path.join(
  __dirname,
  'data',
  'plant_pest_reg.json'
)
const filePathPestDistribution = path.join(
  __dirname,
  'data',
  'pest_distribution.json'
)

const filePathPestFCPD = path.join(__dirname, 'data', 'pest_fcpd.json')

const filePathPestPras = path.join(__dirname, 'data', 'pest_pras.json')

const filePathPestPlantLink = path.join(
  __dirname,
  'data',
  'pest_plant_link.json'
)

const mongoUri = config.get('mongoUri') // Get MongoDB URI from the config

const collectionNamePlant = 'PLANT_DETAIL'
const collectionNameCountry = 'COUNTRIES'
const collectionNameServiceFormat = 'SERVICE_FORMAT'
const collectionNamePlantAnnex6 = 'PLANT_ANNEX6'
const collectionNamePlantAnnex11 = 'PLANT_ANNEX11'
const collectionNamePestName = 'PEST_NAME'
const collectionNamePlantName = 'PLANT_NAME'

const collectionNamePlantPestLink = 'PLANT_PEST_LINK'
const collectionNamePlantPestReg = 'PLANT_PEST_REG'
const collectionPestDistribution = 'PEST_DISTRIBUTION'
const collectionPestFCPD = 'PEST_DOCUMENT_FCPD'
const collectionPestPras = 'PEST_PRA_DATA'
const collectionPestPlantLink = 'PEST_PLANT_LINK'
let isLocked = false
let client = ''

const populateDbHandler = async (request, h) => {
  if (isLocked) {
    return h
      .response({
        status: 'Info',
        message:
          '/PopulateDb load in progress, please try again later if required.'
      })
      .code(429)
  }
  isLocked = true

  try {
    client = new MongoClient(mongoUri)
    await client.connect()
    // clear collections before population
    dropAllCollections(request.server.db)

    await loadData(
      filePathPlant,
      mongoUri,
      request.server.db,
      collectionNamePlant,
      2
    )
    await loadData(
      filePathService,
      mongoUri,
      request.server.db,
      collectionNameServiceFormat,
      1
    )
    await loadData(
      filePathCountry,
      mongoUri,
      request.server.db,
      collectionNameCountry,
      1
    )
    await loadDataForAnnex6(
      filePathServiceAnnex6,
      mongoUri,
      request.server.db,
      collectionNamePlantAnnex6
    )
    await loadData(
      filePathServiceAnnex11,
      mongoUri,
      request.server.db,
      collectionNamePlantAnnex11,
      1
    )
    await loadData(
      filePathServicePestName,
      mongoUri,
      request.server.db,
      collectionNamePestName,
      1
    )
    // Load PLANT DATA - COMBINED - START
    // await loadCombinedDataForPlant(
    //   mongoUri,
    //   request.server.db,
    //   collectionNamePlantName,
    //   1
    // )

    await loadCombinedDataForPlantAndBuildParents(
      mongoUri,
      request.server.db,
      collectionNamePlantName,
      1
    )

    // await loadCombinedDataForPestLink() - DEPRECATED

    await loadData(
      filePathServicePlantPestReg,
      mongoUri,
      request.server.db,
      collectionNamePlantPestReg,
      1
    )
    await loadData(
      filePathPestDistribution,
      mongoUri,
      request.server.db,
      collectionPestDistribution,
      1
    )
    await loadData(
      filePathPestFCPD,
      mongoUri,
      request.server.db,
      collectionPestFCPD,
      1
    )
    await loadData(
      filePathPestPras,
      mongoUri,
      request.server.db,
      collectionPestPras,
      1
    )
    await loadData(
      filePathPestPlantLink,
      mongoUri,
      request.server.db,
      collectionPestPlantLink,
      2
    )
    await buildPlantPestLinkCollection(mongoUri, request.server.db) // PHIDP-462

    return h
      .response({
        status: 'success',
        message: 'Populate Mongo Db successful'
      })
      .code(200)
  } catch (error) {
    // logger.error(error)
    return h.response({ status: 'error', message: error.message }).code(500)
  } finally {
    isLocked = false
    await client.close()
  }
}

async function dropAllCollections(db) {
  logger.info('clear the collections')

  try {
    const collections = await db.collections()

    if (collections.length === 0) {
      logger.info('No collections to drop')
    } else {
      for (const collection of collections) {
        await collection.drop()
        logger.info(`Dropped collection: ${collection.collectionName}`)
      }
      logger.info('All collections dropped')
    }
  } catch (error) {
    logger.error('Error while dropping collections:', error)
  }
}

/*
NOTE: Before introduction of the concept PHIDP-462 (Sub-Family) , 3 levels of hierachy (HOST_REF, PARENT_HOST_REF,
  GRAND_PARENT_HOST_REF) were being generated manually. Introduction of the 4th level, GREAT_GRAND_PARENT_HOST_REF
  made generation of relation upto 4 level quite complex. To tackle that, this process has been automated and instead
  of reading the JSON files manually using loadCombinedDataForPestLink(), buildPlantPestLinkCollection() has been introduce.
*/
async function buildPlantPestLinkCollection(mongoUri, db) {
  logger.info('Start the processing of Plant-Pest links')
  try {
    const plantNameCollection = db.collection(collectionNamePlantName)
    const plantPestLinkCollection = db.collection(collectionNamePlantPestLink)
    const pestPlantLinkCollection = db.collection(collectionPestPlantLink)

    // Fetch all documents from PLANT_NAME collection
    const plantDocuments = await plantNameCollection.find({}).toArray()

    // Fetch all PEST_PLANT_LINK docs upfront to avoid multiple queries
    const pestPlantLinkDocs = await pestPlantLinkCollection.find({}).toArray()

    // Create a map for pestPlantLinkDocs based on HOST_REF for fast lookups
    const pestLinkMap = new Map()
    pestPlantLinkDocs.forEach((doc) => {
      if (!pestLinkMap.has(doc.HOST_REF)) {
        pestLinkMap.set(doc.HOST_REF, [])
      }
      pestLinkMap.get(doc.HOST_REF).push(doc.CSL_REF)
    })

    // Prepare an array for batch insertion
    const batchInsertArray = []

    // Iterate over plant documents
    for (const plant of plantDocuments) {
      const hierarchy = [
        plant.HOST_REF,
        plant.PARENT_HOST_REF,
        plant.GRAND_PARENT_HOST_REF,
        plant.GREAT_GRAND_PARENT_HOST_REF
      ]

      const plantHostRef = +hierarchy[0]

      // Use a Set to avoid duplicate entries
      const uniqueHostCslSet = new Set()

      // Process each level of the hierarchy
      for (const hostRef of hierarchy) {
        if (!hostRef) continue // Skip if hostRef is undefined or null

        const cslRefs = pestLinkMap.get(+hostRef)
        if (cslRefs) {
          // Add each unique CSL_REF for the current host_ref
          cslRefs.forEach((cslRef) => {
            const key = `${plantHostRef}-${cslRef}`
            if (!uniqueHostCslSet.has(key)) {
              uniqueHostCslSet.add(key)
              batchInsertArray.push({ HOST_REF: plantHostRef, CSL_REF: cslRef })
            }
          })
        }
      }

      // Batch insert the unique pairs for this plant document
      if (batchInsertArray.length > 0) {
        await plantPestLinkCollection.insertMany(batchInsertArray, {
          ordered: false
        })
        batchInsertArray.length = 0
      }
    }

    logger.info(`Plant-Pest links processed successfully`)
  } catch (error) {
    logger.info(`Error processing plant-pest links: ${error}`)
  }
}

async function loadDataForAnnex6(filePath, mongoUri, db, collectionName) {
  logger.info('loading Annex6')
  const fileContents = await fs.readFile(filePath, 'utf-8')
  const jsonData = await JSON.parse(fileContents)

  // BUILD THE GRAND PARENT AND GREAT GRAND PARENT HIERARCHY

  // Create a mapping of HOST_REF to annex6 objects
  const annex6Map = new Map()
  jsonData.forEach((annex6) => {
    annex6Map.set(annex6.HOST_REF, { ...annex6 })
  })

  // // Build the hierarchy
  jsonData.forEach((annex6) => {
    const parentRef = String(annex6.PARENT_HOST_REF)
    if (parentRef && annex6Map.has(parentRef)) {
      const parentAnnex6 = annex6Map.get(parentRef)
      annex6.GRAND_PARENT_HOST_REF =
        String(parentAnnex6.PARENT_HOST_REF) || null
      if (
        annex6.GRAND_PARENT_HOST_REF &&
        annex6Map.has(String(annex6.GRAND_PARENT_HOST_REF))
      ) {
        const grandParentAnnex6 = annex6Map.get(annex6.GRAND_PARENT_HOST_REF)
        annex6.GREAT_GRAND_PARENT_HOST_REF =
          String(grandParentAnnex6.PARENT_HOST_REF) || null
      }
    }
  })
  // --------------------------------------------------------

  try {
    const collection = db.collection(collectionName)
    await dropCollections(db, collectionName, client)
    await collection.insertMany(jsonData)
    logger.info('Annex6 loading completed')
  } catch (error) {
    logger.info('Annex6 loading failed:', error)
  }
}

// async function loadCombinedDataForPlant(mongoUri, db, collectionName) {
//   logger.info('loading Plant_Name data')
//   const filePathServicePlantName = path.join(
//     __dirname,
//     'data',
//     'plant_name.json'
//   )
//   const filePathServicePlantNameRest = path.join(
//     __dirname,
//     'data',
//     'plant_name_rest.json'
//   )

//   const data1 = await readJsonFile(filePathServicePlantName)
//   const data2 = await readJsonFile(filePathServicePlantNameRest)

//   const combinedData = [...data1?.PLANT_NAME, ...data2?.PLANT_NAME]

//   // BUILD THE GRAND PARENT AND GREAT GRAND PARENT HIERARCHY

//   // Create a mapping of HOST_REF to plant objects
//   const plantMap = new Map()
//   combinedData.forEach((plant) => {
//     plantMap.set(plant.HOST_REF, { ...plant })
//   })

//   // Build the hierarchy
//   combinedData.forEach((plant) => {
//     const parentRef = String(plant.PARENT_HOST_REF)
//     if (parentRef && plantMap.has(parentRef)) {
//       const parentPlant = plantMap.get(parentRef)
//       plant.GRAND_PARENT_HOST_REF = String(parentPlant.PARENT_HOST_REF) || null
//       if (
//         plant.GRAND_PARENT_HOST_REF &&
//         plantMap.has(plant.GRAND_PARENT_HOST_REF)
//       ) {
//         const grandParentPlant = plantMap.get(
//           String(plant.GRAND_PARENT_HOST_REF)
//         )
//         plant.GREAT_GRAND_PARENT_HOST_REF =
//           grandParentPlant.PARENT_HOST_REF || null
//       }
//     }
//   })
//   // --------------------------------------------------------

//   try {
//     const collection = db.collection(collectionName)
//     await dropCollections(db, collectionName, client)
//     await collection.insertMany(combinedData)
//     logger.info('loading of Plant_Name completed')
//   } catch (error) {
//     logger.info('loading of Plant_Name failed: ', error)
//   }
// }

async function loadCombinedDataForPlantAndBuildParents(
  mongoUri,
  db,
  collectionName
) {
  logger.info('loading Plant_Name_Temp data')
  const filePathServicePlantName = path.join(
    __dirname,
    'data',
    'PlantDataJson1V0.36Base.json'
  )
  const filePathServicePlantNameRest = path.join(
    __dirname,
    'data',
    'PlantDataJson2V0.36Base.json'
  )

  const data1 = await readJsonFile(filePathServicePlantName)
  const data2 = await readJsonFile(filePathServicePlantNameRest)
  const combinedData = [...data1, ...data2]

  // Create a mapping of HOST_REF to plant objects
  const plantMap = new Map()
  combinedData.forEach((plant) => {
    plantMap.set(plant.HOST_REF, { ...plant })
  })

  const collection = db.collection(collectionName)
  await dropCollections(db, collectionName, client)
  await collection.insertMany(combinedData)

  // Prepare bulk update operations
  const bulkOps = []

  for (const h1 of combinedData) {
    const h1HostRef = h1.HOST_REF
    const parentHostRef = h1.PARENT_HOST_REF

    // Use plantMap to find parentDoc
    const parentDoc = plantMap.get(parentHostRef)

    if (parentDoc) {
      const grandParentHostRef = parentDoc.PARENT_HOST_REF

      // Prepare update for GRAND_PARENT_HOST_REF
      bulkOps.push({
        updateOne: {
          filter: { HOST_REF: h1HostRef },
          update: { $set: { GRAND_PARENT_HOST_REF: grandParentHostRef || '' } }
        }
      })

      // Use plantMap to find grandParentDoc
      const grandParentDoc = plantMap.get(grandParentHostRef)

      // Prepare update for GREAT_GRAND_PARENT_HOST_REF
      bulkOps.push({
        updateOne: {
          filter: { HOST_REF: h1HostRef },
          update: {
            $set: {
              GREAT_GRAND_PARENT_HOST_REF: grandParentDoc
                ? grandParentDoc.PARENT_HOST_REF || ''
                : ''
            }
          }
        }
      })
    } else {
      // Prepare updates if parentDoc not found
      bulkOps.push({
        updateOne: {
          filter: { HOST_REF: h1HostRef },
          update: {
            $set: { GRAND_PARENT_HOST_REF: '', GREAT_GRAND_PARENT_HOST_REF: '' }
          }
        }
      })
    }
  }

  // Execute all bulk operations at once
  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps)
  }

  logger.info('loading of Plant_Name_Temp completed')
}

async function readJsonFile(filePath) {
  const timeout = 10000 // await config.get('readTimeout')
  // logger.info('Timeout value is: ', timeout)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Read file operation timed out'))
    }, timeout)

    fs.readFile(filePath, 'utf8')
      .then((data) => {
        clearTimeout(timer)
        resolve(JSON.parse(data))
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

async function loadData(filePath, mongoUri, db, collectionName, indicator) {
  const fileContents = await fs.readFile(filePath, 'utf-8')
  const jsonData = await JSON.parse(fileContents)

  try {
    logger.info(`loading the data from JSON for collection: ${collectionName}`)
    const collection = db.collection(collectionName)
    await dropCollections(db, collectionName)
    if (indicator === 1) {
      await collection.insertOne(jsonData)
    } else if (indicator === 2) {
      await collection.insertMany(jsonData)
    }
  } catch (error) {
    logger.info('loading the data from JSON for collection failed: ', error)
  }
}

async function dropCollections(db, collection) {
  const collections = await db.listCollections({ name: collection }).toArray()
  if (collections.length > 0) {
    await db.dropCollection(collection, function (err, result) {
      if (err) {
        // eslint-disable-next-line no-console
        logger.error('Error occurred while dropping the collection', err)
        return
      }
      // eslint-disable-next-line no-console
      logger.info('Collection dropped successfully')
    })
  }
}
export {
  populateDbHandler,
  loadData,
  loadCombinedDataForPlantAndBuildParents,
  loadDataForAnnex6,
  readJsonFile
}
