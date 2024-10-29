import { createLogger } from '~/src/helpers/logging/logger'
import { pestDetail } from '../models/pestDetail'

const logger = createLogger()
let isLocked = false
const updateDbPestHandler = async (request, h, isLocked) => {
  if (isLocked) {
    return h
      .response({
        status: 'Info',
        message:
          '/udpatePest load in progress, please try again later if required.'
      })
      .code(429)
  }
  isLocked = true

  try {
    await loadData(request.server.db)
    return h.response({
      status: 'success',
      message: 'Update Pest Db successful'
    })
  } catch (error) {
    logger?.error(error)
    return h.response({ status: 'error', message: error.message }).code(500)
  }
}

async function loadData(db) {
  try {
    logger?.info('Connected successfully to server')

    const pestList = await getPestList(db)
    const plantPestLinkList = await getPlantPestLinkList(db)
    const plantList = await getPlantList(db)
    const pestPrasList = await getPestPrasList(db)
    const pestFcpdList = await getPestFcpdList(db)
    const plantPestRegList = await getPlantPestRegList(db)

    // await dropCollectionIfExists(db, 'PEST_DATA_TEMP')

    const resultList = preparePestDetails(pestList)
    updateResultListWithLinks(
      resultList,
      plantPestLinkList,
      pestPrasList,
      pestFcpdList
    )

    const pestDistributionList = await getPestDistributionList(db)
    updateResultListWithDistribution(resultList, pestDistributionList)
    updatePlantLinksWithNames(resultList, plantList)
    updatePestRegulations(resultList, plantPestRegList)
    await insertResultList(db, 'PEST_DATA_TEMP', resultList)
  } catch (err) {
    logger?.error(err)
    throw err
  } finally {
    isLocked = false
  }
}

async function getPlantPestRegList(db) {
  const collection = db.collection('PLANT_PEST_REG_TEMP')
  const documents = await collection.find({}).toArray()
  const plantPestRegList = documents[0]?.PLANT_PEST_REG
  logger?.info(`plantPestRegList: ${plantPestRegList?.length}`)
  return plantPestRegList
}

async function getPestList(db) {
  const collection = db.collection('PEST_NAME_TEMP')
  const documents = await collection.find({}).toArray()
  const pestList = documents[0]?.PEST_NAME
  logger?.info(`pestList: ${pestList?.length}`)
  return pestList
}

async function getPlantPestLinkList(db) {
  const collection = db.collection('PEST_PLANT_LINK_TEMP')
  return await collection.find({}).toArray()
}

async function getPlantList(db) {
  const collection = db.collection('PLANT_NAME_TEMP')
  return await collection.find({}).toArray()
}

async function getPestPrasList(db) {
  const collection = db.collection('PEST_PRA_DATA_TEMP')
  const documents = await collection.find({}).toArray()
  const pestPrasList = documents[0]?.PEST_PRA_DATA
  logger?.info(`pestPrasList: ${pestPrasList?.length}`)
  return pestPrasList
}

async function getPestFcpdList(db) {
  const collection = db.collection('PEST_DOCUMENT_FCPD_TEMP')
  const documents = await collection.find({}).toArray()
  const pestFcpdList = documents[0]?.PEST_DOCUMENT_FCPD
  logger?.info(`pestFcpdList: ${pestFcpdList?.length}`)
  return pestFcpdList
}

async function dropCollectionIfExists(db, collectionName) {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray()
  if (collections.length > 0) {
    await db.collection(collectionName).drop()
    logger?.info(`Collection ${collectionName} dropped.`)
  }
}

function preparePestDetails(pestList) {
  return pestList.map((pest) => {
    const psDetail = pestDetail.get('pestDetail')
    psDetail.EPPO_CODE = pest?.EPPO_CODE
    psDetail.CSL_REF = pest?.CSL_REF
    psDetail.LATIN_NAME = pest?.LATIN_NAME

    const cnameList = pest?.COMMON_NAME?.COMMON_NAME?.filter(
      (name) => name !== ''
    )
    const snameList = pest?.SYNONYM_NAME?.SYNONYM_NAME?.filter(
      (name) => name !== ''
    )
    psDetail.PEST_NAME = [
      { type: 'LATIN_NAME', NAME: pest?.LATIN_NAME },
      { type: 'COMMON_NAME', NAME: cnameList },
      { type: 'SYNONYM_NAME', NAME: snameList }
    ]

    return psDetail
  })
}

function updateResultListWithLinks(
  resultList,
  plantPestLinkList,
  pestPrasList,
  pestFcpdList
) {
  updateResultListWithPlantLinks(resultList, plantPestLinkList)
  updateResultListWithDocuments(resultList, pestPrasList)
  updateResultListWithDocuments(resultList, pestFcpdList)
}

function updateResultListWithPlantLinks(resultList, plantPestLinkList) {
  const pestLinkResultList = resultList.map((pest) => {
    const pplList = plantPestLinkList
      .filter((link) => link.CSL_REF === pest.CSL_REF)
      .map((link) => ({
        PLANT_NAME: { TYPE: 'string', NAME: 'string' },
        HOST_REF: link?.HOST_REF,
        HOST_CLASS: link?.HOST_CLASS
      }))

    return { CSL_REF: pest.CSL_REF, PLANT_LINK: pplList }
  })

  resultList.forEach((pest) => {
    const pestLink = pestLinkResultList.find(
      (link) => link.CSL_REF === pest.CSL_REF
    )
    if (pestLink) {
      pest.PLANT_LINK = pestLink.PLANT_LINK
    }
  })
}

function updateResultListWithDocuments(resultList, documentList) {
  const documentResultList = resultList.map((pest) => {
    const documentLinks = documentList
      .filter((doc) => doc.CSL_REF === pest.CSL_REF)
      .map((doc) => ({
        DOCUMENT_TYPE: doc?.DOCUMENT_TYPE,
        DOCUMENT_TITLE: doc?.DOCUMENT_TITLE,
        DOCUMENT_HYPER_LINK: doc?.DOCUMENT_HYPER_LINK,
        VISIBLE_ON_PHI_INDICATOR: doc?.VISIBLE_ON_PHI_INDICATOR,
        PUBLICATION_DATE: doc?.PUBLICATION_DATE,
        DOCUMENT_SIZE: doc?.DOCUMENT_SIZE,
        NO_OF_PAGE: 'string',
        DOCUMENT_FORMAT: doc?.DOCUMENT_FORMAT,
        PARENT_CSL_REF: 'string'
      }))

    return { CSL_REF: pest.CSL_REF, DOCUMENT_LINK: documentLinks }
  })

  resultList.forEach((pest) => {
    const documentLink = documentResultList.find(
      (doc) => doc.CSL_REF === pest.CSL_REF
    )
    if (documentLink) {
      if (!pest.DOCUMENT_LINK) {
        pest.DOCUMENT_LINK = []
      }
      pest.DOCUMENT_LINK.push(...documentLink.DOCUMENT_LINK)
    }
  })
}

async function getPestDistributionList(db) {
  const collection = db.collection('PEST_DISTRIBUTION_TEMP')
  const documents = await collection.find({}).toArray()
  return documents[0]?.PEST_DISTRIBUTION
}

function updateResultListWithDistribution(resultList, pestDistributionList) {
  const countryResultList = resultList.map((pest) => {
    const countries = pestDistributionList
      .filter((dist) => dist.CSL_REF === pest.CSL_REF)
      .map((dist) => ({
        COUNTRY_CODE: dist.COUNTRY_CODE,
        COUNTRY_NAME: dist.COUNTRY_NAME,
        COUNTRY_STATUS: dist.STATUS
      }))

    return { CSL_REF: pest.CSL_REF, COUNTRIES: countries }
  })

  resultList.forEach((pest) => {
    const countryLink = countryResultList.find(
      (link) => link.CSL_REF === pest.CSL_REF
    )
    if (countryLink) {
      pest.PEST_COUNTRY_DISTRIBUTION = countryLink.COUNTRIES
    }
  })
}

function updatePlantLinksWithNames(resultList, plantList) {
  resultList.forEach((pest) => {
    pest?.PLANT_LINK?.forEach((link) => {
      const plant = plantList.find((p) => p.HOST_REF === link.HOST_REF)
      if (plant) {
        const cnameList = plant?.COMMON_NAME?.NAME?.filter(
          (name) => name !== ''
        )
        const snameList = plant?.SYNONYM_NAME?.NAME?.filter(
          (name) => name !== ''
        )
        link.PLANT_NAME = [
          { type: 'LATIN_NAME', NAME: plant?.LATIN_NAME },
          { type: 'COMMON_NAME', NAME: cnameList },
          { type: 'SYNONYM_NAME', NAME: snameList }
        ]
        link.HOST_REF = plant.HOST_REF
        link.EPPO_CODE = plant?.EPPO_CODE
        link.LATIN_NAME = plant.LATIN_NAME
        link.PARENT_HOST_REF = plant.PARENT_HOST_REF
      }
    })
  })
}
function updatePestRegulations(resultList, plantPestRegList) {
  resultList.forEach((pest) => {
    plantPestRegList.forEach((reg) => {
      if (reg?.CSL_REF === pest?.CSL_REF) {
        pest.QUARANTINE_INDICATOR = reg?.QUARANTINE_INDICATOR
        pest.REGULATION_INDICATOR = reg?.REGULATION_INDICATOR
        pest.REGULATION_CATEGORY = reg?.REGULATION_CATEGORY
      }
    })
  })
}
async function insertResultList(db, collectionName, resultList) {
  const collection = db.collection(collectionName)
  const result = await collection.insertMany(resultList)
  logger?.info(`${result.insertedCount} pest documents were inserted...`)
}

export {
  updateDbPestHandler,
  dropCollectionIfExists,
  loadData,
  getPestList,
  preparePestDetails
}
