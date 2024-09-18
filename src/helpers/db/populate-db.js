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
    await loadCombinedDataForPlant(
      mongoUri,
      request.server.db,
      collectionNamePlantName,
      1
    )
    // Load PLANT DATA - Combined - END

    // // Load PEST_LINK DATA - START
    // await loadCombinedDataForPestLink(
    //   mongoUri,
    //   request.server.db,
    //   collectionNamePlantPestLink,
    //   1
    // )
    // // Load PEST_LINK DATA - END
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
    await buildPlantPestLinkCollection(mongoUri, request.server.db)

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
  }
}

async function buildPlantPestLinkCollection(mongoUri, db) {
  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    const plantNameCollection = db.collection(collectionNamePlantName)
    const plantPestLinkCollection = db.collection(collectionNamePlantPestLink)
    const pestPlantLinkCollection = db.collection(collectionPestPlantLink)
 
    // Clear existing entries (optional)
    await dropCollections(db, collectionNamePlantPestLink, client)
 
    const plants = await plantNameCollection.find().toArray()
    const uniqueHRandCSLRefComb = new Set()
    const uniqueEntries = []
 
    for (const plant of plants) {
      const refs = [
        plant.HOST_REF,
        plant.PARENT_HOST_REF,
        plant.GRAND_PARENT_HOST_REF,
        plant.GREAT_GRAND_PARENT_HOST_REF
      ]
 
      for (const ref of refs) {
        if (!ref) continue // Skip null references
 
        const pestLinks = await pestPlantLinkCollection.find({ HOST_REF: ref }).toArray()
 
        for (const pestLink of pestLinks) {
          const combinationKey = `${pestLink.HOST_REF}-${pestLink.CSL_REF}`
 
          if (!uniqueHRandCSLRefComb.has(combinationKey)) {
            uniqueHRandCSLRefComb.add(combinationKey)
            uniqueEntries.push({
              HOST_REF: pestLink.HOST_REF,
              CSL_REF: pestLink.CSL_REF
            })
          }
        }
      }
    }
 
    // Insert all unique entries at once
    if (uniqueEntries.length > 0) {
      await plantPestLinkCollection.insertMany(uniqueEntries)
    }
 
    // Optional: Create a unique index for future reference
    await plantPestLinkCollection.createIndex(
      { HOST_REF: 1, CSL_REF: 1 },
      { unique: true }
    )
 
    logger.info('Plant-Pest links processed successfully')
  } catch (error) {
    logger.info('Error processing plant-pest links:', error)
  } finally {
    await client.close()
  }
}

async function loadDataForAnnex6(filePath, mongoUri, db, collectionName) {
  const fileContents = await fs.readFile(filePath, 'utf-8')
  const jsonData = await JSON.parse(fileContents)

  // BUILD THE GRAND PARENT AND GREAT GRAND PARENT HIERARCHY

  // Create a mapping of HOST_REF to annex6 objects
  const annex6Map = new Map()
  jsonData.forEach((annex6) => {
    annex6Map.set(annex6.HOST_REF, { ...annex6 })
  })

  // Build the hierarchy
  jsonData.forEach((annex6) => {
    const parentRef = annex6.PARENT_HOST_REF
    if (parentRef && annex6Map.has(parentRef)) {
      const parentAnnex6 = annex6Map.get(parentRef)
      annex6.GRAND_PARENT_HOST_REF = parentAnnex6.PARENT_HOST_REF || null
      if (
        annex6.GRAND_PARENT_HOST_REF &&
        annex6Map.has(annex6.GRAND_PARENT_HOST_REF)
      ) {
        const grandParentAnnex6 = annex6Map.get(annex6.GRAND_PARENT_HOST_REF)
        annex6.GREAT_GRAND_PARENT_HOST_REF =
          grandParentAnnex6.PARENT_HOST_REF || null
      }
    }
  })
  // --------------------------------------------------------

  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    const collection = db.collection(collectionName)
    await dropCollections(db, collectionName, client)
    await collection.insertMany(jsonData)
  } catch (error) {
  } finally {
    await client.close()
  }
}

async function loadCombinedDataForPlant(mongoUri, db, collectionName) {
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

  const combinedData = [...data1?.PLANT_NAME, ...data2?.PLANT_NAME]

  // BUILD THE GRAND PARENT AND GREAT GRAND PARENT HIERARCHY

  // Create a mapping of HOST_REF to plant objects
  const plantMap = new Map()
  combinedData.forEach((plant) => {
    plantMap.set(plant.HOST_REF, { ...plant })
  })

  // Build the hierarchy
  combinedData.forEach((plant) => {
    const parentRef = plant.PARENT_HOST_REF
    if (parentRef && plantMap.has(parentRef)) {
      const parentPlant = plantMap.get(parentRef)
      plant.GRAND_PARENT_HOST_REF = parentPlant.PARENT_HOST_REF || null
      if (
        plant.GRAND_PARENT_HOST_REF &&
        plantMap.has(plant.GRAND_PARENT_HOST_REF)
      ) {
        const grandParentPlant = plantMap.get(plant.GRAND_PARENT_HOST_REF)
        plant.GREAT_GRAND_PARENT_HOST_REF =
          grandParentPlant.PARENT_HOST_REF || null
      }
    }
  })
  // --------------------------------------------------------

  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    const collection = db.collection(collectionName)
    await dropCollections(db, collectionName, client)
    await collection.insertMany(combinedData)
  } catch (error) {
  } finally {
    await client.close()
  }
}

// async function loadCombinedDataForPestLink(mongoUri, db, collectionName) {
//   const filePathServicePlantPestLink1 = path.join(
//     __dirname,
//     'data',
//     'plant_pest_link1.json'
//   )
//   const filePathServicePlantPestLink2 = path.join(
//     __dirname,
//     'data',
//     'plant_pest_link2.json'
//   )
//   const filePathServicePlantPestLink3 = path.join(
//     __dirname,
//     'data',
//     'plant_pest_link3.json'
//   )

//   const data1 = await readJsonFile(filePathServicePlantPestLink1)
//   const data2 = await readJsonFile(filePathServicePlantPestLink2)
//   const data3 = await readJsonFile(filePathServicePlantPestLink3)

//   const combinedData = [
//     ...data1?.PLANT_PEST_LINK,
//     ...data2?.PLANT_PEST_LINK,
//     ...data3?.PLANT_PEST_LINK
//   ]

//   const client = new MongoClient(mongoUri)
//   try {
//     await client.connect()
//     const collection = db.collection(collectionName)
//     await dropCollections(db, collectionName, client)
//     await collection.insertMany(combinedData)
//   } catch (error) {
//   } finally {
//     await client.close()
//   }
// }

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
    const collection = db.collection(collectionName)
    await dropCollections(db, collectionName)
    if (indicator === 1) {
      await collection.insertOne(jsonData)
    } else if (indicator === 2) {
      await collection.insertMany(jsonData)
    }
  } catch (error) {}
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
export { populateDbHandler, loadData, loadCombinedDataForPlant, readJsonFile }
