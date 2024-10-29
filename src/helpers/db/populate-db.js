import { createLogger } from '~/src/helpers/logging/logger'
import path from 'path'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'

const logger = createLogger()
// const filePathPlant = path.join(__dirname, 'data', 'plantsv1.json')
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

const collectionNameCountry = 'COUNTRIES'
const collectionPestDistribution = 'PEST_DISTRIBUTION'
const collectionPestFCPD = 'PEST_DOCUMENT_FCPD'
const collectionNamePestName = 'PEST_NAME'
const collectionPestPlantLink = 'PEST_PLANT_LINK'
const collectionPestPras = 'PEST_PRA_DATA'
const collectionNamePlantAnnex6 = 'PLANT_ANNEX6'
const collectionNamePlantAnnex11 = 'PLANT_ANNEX11'
const collectionNamePlantName = 'PLANT_NAME'
const collectionNamePlantPestLink = 'PLANT_PEST_LINK'
const collectionNamePlantPestReg = 'PLANT_PEST_REG'
const collectionNameServiceFormat = 'SERVICE_FORMAT'

const temp = '_TEMP'

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

    const db = request.server.db

    await loadData(
      filePathService,
      mongoUri,
      db,
      collectionNameServiceFormat + temp,
      1
    )
    await loadData(
      filePathCountry,
      mongoUri,
      db,
      collectionNameCountry + temp,
      1
    )
    await loadDataForAnnex6(
      filePathServiceAnnex6,
      mongoUri,
      db,
      collectionNamePlantAnnex6 + temp
    )
    await loadData(
      filePathServiceAnnex11,
      mongoUri,
      db,
      collectionNamePlantAnnex11 + temp,
      1
    )
    await loadData(
      filePathServicePestName,
      mongoUri,
      db,
      collectionNamePestName + temp,
      1
    )

    await loadCombinedDataForPlantAndBuildParents(
      mongoUri,
      db,
      collectionNamePlantName + temp,
      1
    )
    await loadData(
      filePathServicePlantPestReg,
      mongoUri,
      db,
      collectionNamePlantPestReg + temp,
      1
    )
    await loadData(
      filePathPestDistribution,
      mongoUri,
      db,
      collectionPestDistribution + temp,
      1
    )
    await loadData(filePathPestFCPD, mongoUri, db, collectionPestFCPD + temp, 1)
    await loadData(filePathPestPras, mongoUri, db, collectionPestPras + temp, 1)
    await loadData(
      filePathPestPlantLink,
      mongoUri,
      db,
      collectionPestPlantLink + temp,
      2
    )
    await buildPlantPestLinkCollection(mongoUri, db) // PHIDP-462

    return h
      .response({
        status: 'success',
        message: 'Populate Mongo Db successful'
      })
      .code(200)
  } catch (error) {
    // logger?.error(error)
    return h.response({ status: 'error', message: error.message }).code(500)
  } finally {
    isLocked = false
    await client.close()
  }
}

/*
NOTE: Before introduction of the concept PHIDP-462 (Sub-Family) , 3 levels of hierachy (HOST_REF, PARENT_HOST_REF,
  GRAND_PARENT_HOST_REF) were being generated manually. Introduction of the 4th level, GREAT_GRAND_PARENT_HOST_REF
  made the manual generation process 4 level quite complex. To tackle that, this process has been automated and instead
  of reading the JSON files manually using loadCombinedDataForPestLink(), buildPlantPestLinkCollection() has been introduce.
*/
async function buildPlantPestLinkCollection(mongoUri, db) {
  logger?.info('Start the processing of Plant-Pest links')
  try {
    const plantNameCollection = db.collection(collectionNamePlantName + temp)
    const plantPestLinkCollection = db.collection(
      collectionNamePlantPestLink + temp
    )
    const pestPlantLinkCollection = db.collection(
      collectionPestPlantLink + temp
    )

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

    logger?.info(`Plant-Pest links processed successfully`)
  } catch (error) {
    logger?.info(`Error processing plant-pest links: ${error}`)
  }
}

async function loadDataForAnnex6(filePath, mongoUri, db, collectionName) {
  logger?.info('loading Annex6')
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
    logger?.info('Annex6 loading completed')
  } catch (error) {
    logger?.info('Annex6 loading failed:', error)
  }
}

async function loadCombinedDataForPlantAndBuildParents(
  mongoUri,
  db,
  collectionName
) {
  logger.info('loading Plant_Name data')
  const filePathServicePlantName = path.join(
    __dirname,
    'data',
    'plant_name.json'
  )
  const filePathServicePlantNameRest = path.join(
    __dirname,
    'data',
    'plant_name_rest.json'
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

  logger.info('loading of Plant_Name completed')
}

async function readJsonFile(filePath) {
  const timeout = 10000 // await config.get('readTimeout')
  // logger?.info('Timeout value is: ', timeout)

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
    logger?.info(`loading the data from JSON for collection: ${collectionName}`)
    const collection = db.collection(collectionName)
    await dropCollections(db, collectionName)
    if (indicator === 1) {
      await collection.insertOne(jsonData)
    } else if (indicator === 2) {
      await collection.insertMany(jsonData)
    }
  } catch (error) {
    logger?.info('loading the data from JSON for collection failed: ', error)
  }
}

async function dropCollections(db, collection) {
  const collections = await db.listCollections({ name: collection }).toArray()
  if (collections.length > 0) {
    await db.dropCollection(collection, function (err, result) {
      if (err) {
        // eslint-disable-next-line no-console
        logger?.error('Error occurred while dropping the collection', err)
        return
      }
      // eslint-disable-next-line no-console
      logger?.info('Collection dropped successfully')
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
