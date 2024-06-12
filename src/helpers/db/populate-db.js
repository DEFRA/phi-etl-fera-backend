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

const populateDb = {
  plugin: {
    name: 'Populate MongoDb',
    register: async (server) => {
      server.route({
        method: 'POST',
        path: '/populateDb',
        handler: async (request, h) => {
          try {
            await loadData(
              filePathPlant,
              mongoUri,
              server.db,
              collectionNamePlant,
              2
            )
            await loadData(
              filePathService,
              mongoUri,
              server.db,
              collectionNameServiceFormat,
              1
            )
            await loadData(
              filePathCountry,
              mongoUri,
              server.db,
              collectionNameCountry,
              1
            )
            await loadData(
              filePathServiceAnnex6,
              mongoUri,
              server.db,
              collectionNamePlantAnnex6,
              1
            )
            await loadData(
              filePathServiceAnnex11,
              mongoUri,
              server.db,
              collectionNamePlantAnnex11,
              1
            )
            await loadData(
              filePathServicePestName,
              mongoUri,
              server.db,
              collectionNamePestName,
              1
            )
            // Load PLANT DATA - COMBINED - START
            await loadCombinedDataForPlant(
              mongoUri,
              server.db,
              collectionNamePlantName,
              1
            )
            // Load PLANT DATA - Combined - END

            // Load PEST_LINK DATA - START
            await loadCombinedDataForPestLink(
              mongoUri,
              server.db,
              collectionNamePlantPestLink,
              1
            )
            // Load PEST_LINK DATA - END
            await loadData(
              filePathServicePlantPestReg,
              mongoUri,
              server.db,
              collectionNamePlantPestReg,
              1
            )
            await loadData(
              filePathPestDistribution,
              mongoUri,
              server.db,
              collectionPestDistribution,
              1
            )
            await loadData(
              filePathPestFCPD,
              mongoUri,
              server.db,
              collectionPestFCPD,
              1
            )
            await loadData(
              filePathPestPras,
              mongoUri,
              server.db,
              collectionPestPras,
              1
            )

            // await server.start()
            return h
              .response({
                status: 'success',
                message: 'Populate Mongo Db successful'
              })
              .code(200)
          } catch (error) {
            logger.error(error)
            return h
              .response({ status: 'error', message: error.message })
              .code(500)
          }
        }
      })
    }
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

async function loadCombinedDataForPestLink(mongoUri, db, collectionName) {
  const filePathServicePlantPestLink1 = path.join(
    __dirname,
    'data',
    'plant_pest_link1.json'
  )
  const filePathServicePlantPestLink2 = path.join(
    __dirname,
    'data',
    'plant_pest_link2.json'
  )
  const filePathServicePlantPestLink3 = path.join(
    __dirname,
    'data',
    'plant_pest_link3.json'
  )

  const data1 = await readJsonFile(filePathServicePlantPestLink1)
  const data2 = await readJsonFile(filePathServicePlantPestLink2)
  const data3 = await readJsonFile(filePathServicePlantPestLink3)

  const combinedData = [
    ...data1?.PLANT_PEST_LINK,
    ...data2?.PLANT_PEST_LINK,
    ...data3?.PLANT_PEST_LINK
  ]

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

async function readJsonFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
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
        console.error('Error occurred while dropping the collection', err)
        return
      }
      // eslint-disable-next-line no-console
      console.log('Collection dropped successfully')
    })
  }
}
export { populateDb }
