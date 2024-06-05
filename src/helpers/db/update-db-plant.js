import { createLogger } from '~/src/helpers/logging/logger'
import { plantDetail } from '../models/plantDetail'

const logger = createLogger()

// Populate the DB in this template on startup of the API.
// This is an example to show developers an API with a DB, with data in it and endpoints that query the db.
const updateDbPlant = {
  plugin: {
    name: 'Update Plant DB',
    register: async (server) => {
      try {
        await loadData(server.db)
      } catch (error) {
        logger.error(error)
      }
    }
  }
}
async function loadData(db) {
  try {
    // Connect the client to the server
    logger.info('Connected successfully to server')

    // Select the collection
    const collection = db.collection('PLANT_NAME')
    // Find all documents in the collection
    const documents = await collection.find({}).toArray()
    // Read Plants
    const plantList = documents

    const collectionName = 'PLANT_DATA'
    const collectionPlant = db.collection(collectionName)

    // Select the Annex
    const collectionAnnex11 = db.collection('PLANT_ANNEX11')
    const collectionAnnex6 = db.collection('PLANT_ANNEX6')

    // Find all the Annex documents

    const collectionAnnex11Documents = await collectionAnnex11
      .find({})
      .toArray()
    const collectionAnnex6Documents = await collectionAnnex6.find({}).toArray()

    // Read Annex 11 and 6
    const annex11List = collectionAnnex11Documents[0]?.PLANT_ANNEX11
    const annex6List = collectionAnnex6Documents[0]?.PLANT_ANNEX6

    // Select and Find all Plants Pest Link
    const plantPestLinkList = await db
      .collection('PLANT_PEST_LINK')
      .find({})
      .toArray()
    const collectionPlantPestReg = await db
      .collection('PLANT_PEST_REG')
      .find({})
      .toArray()
    const plantPestRegList = collectionPlantPestReg[0]?.PLANT_PEST_REG

    // Read Pest names
    const collectionPestNames = await db
      .collection('PEST_NAME')
      .find({})
      .toArray()
    const pestNamesList = collectionPestNames[0]?.PEST_NAME

    // Read PEST DISTRIBUTION
    const collectionPestDistribution = await db
      .collection('PEST_DISTRIBUTION')
      .find({})
      .toArray()
    const pestDistributionList =
      collectionPestDistribution[0]?.PEST_DISTRIBUTION

    logger.info(`Annex11: ${annex11List?.length}`)
    logger.info(`Annex6: ${annex6List?.length}`)
    logger.info(`plantList: ${plantList?.length}`)
    logger.info(`plantPestLinkList: ${plantPestLinkList?.length}`)
    logger.info(`plantPestRegList: ${plantPestRegList?.length}`)
    logger.info(`pestNamesList: ${pestNamesList?.length}`)
    logger.info(`pestDistributionList: ${pestDistributionList?.length}`)
    // Drop the collection if it exists
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray()
    if (collections.length > 0) {
      await collectionPlant.drop()
      logger.info(`Collection ${collectionName} dropped.`)
    }
    const collectionNew = db.collection('PLANT_DATA')

    const resultList = plantList.map((plant) => {
      const plDetail = plantDetail.get('plantDetail')
      plDetail.EPPO_CODE = plant?.EPPO_CODE
      plDetail.HOST_REF = plant?.HOST_REF
      plDetail.TAXONOMY = plant?.TAXONOMY

      const cnameList = plant?.COMMON_NAME?.NAME.map((name) => name).filter(
        (x) => x !== ''
      )
      const snameList = plant?.SYNONYM_NAME?.NAME.map((name) => name).filter(
        (x) => x !== ''
      )
      plDetail.PLANT_NAME = [
        { type: 'LATIN_NAME', NAME: plant?.LATIN_NAME },
        { type: 'COMMON_NAME', NAME: cnameList },
        { type: 'SYNONYM_NAME', NAME: snameList }
      ]
      return plDetail
    })
    logger.info(`resultList: ${resultList?.length}`)

    // ANNEX6 mapping

    const annex6ResultList = resultList.map((nx6) => {
      const nx6List = annex6List.filter((n6) => n6.HOST_REF === nx6.HOST_REF)
      return { HOST_REF: nx6.HOST_REF, ANNEX6: nx6List }
    })

    // ANNEX11 mapping

    const annex11ResultList = resultList.map((nx11) => {
      const nx11List = annex11List.filter(
        (n11) => +n11.HOST_REF === +nx11.HOST_REF
      )
      return { HOST_REF: nx11.HOST_REF, ANNEX11: nx11List }
    })

    const annex11ResultListDefault = annex11List.filter(
      (n11) => +n11.HOST_REF === 99999
    )

    // update ResultList with ANNEX6 information
    resultList.forEach((x) => {
      annex6ResultList.forEach((nx6) => {
        if (x.HOST_REF === nx6.HOST_REF) {
          x.HOST_REGULATION.ANNEX6 = nx6.ANNEX6
        }
      })
    })

    // update ResultList with ANNEX11 information
    resultList.forEach((x) => {
      annex11ResultList.forEach((nx11) => {
        if (x.HOST_REF === nx11.HOST_REF) {
          x.HOST_REGULATION.ANNEX11 = nx11.ANNEX11
        } else {
          x.HOST_REGULATION.ANNEX11 = annex11ResultListDefault
        }
      })
    })

    // update ResultList with PLANT_PEST_LINK

    const pestLinkResultList = resultList.map((plantItem) => {
      const pplList = plantPestLinkList
        .filter((cListItem) => cListItem.HOST_REF === plantItem.HOST_REF)
        .map((cListItem) => ({
          CSL_REF: cListItem.CSL_REF,
          HOST_CLASS: cListItem.HOST_CLASS,
          PEST_NAME: {
            TYPE: '',
            NAME: ''
          },
          EPPO_CODE: '',
          FORMAT: {
            FORMAT: '',
            FORMAT_ID: ''
          },
          LATIN_NAME: '',
          PARENT_CSL_REF: '',
          PEST_COUNTRY: [
            {
              COUNTRY_CODE: '',
              COUNTRY_NAME: '',
              COUNTRY_STATUS: ''
            }
          ],
          REGULATION: '',
          QUARANTINE_INDICATOR: '',
          REGULATED_INDICATOR: ''
        }))

      return {
        HOST_REF: plantItem.HOST_REF,
        PEST_LINK: pplList
      }
    })
    logger.info(`pestLinkResultList: ${pestLinkResultList?.length}`)

    resultList.forEach((x) => {
      pestLinkResultList?.forEach((pest) => {
        if (x?.HOST_REF === pest?.HOST_REF) {
          x.PEST_LINK = pest?.PEST_LINK
        }
      })
    })

    // update ResultList with PEST_NAME
    resultList.forEach((pl) => {
      pestNamesList?.forEach((pest) => {
        pl.PEST_LINK?.forEach((x) => {
          if (x?.CSL_REF === pest?.CSL_REF) {
            // populate Pest Names
            const cnameList = pest?.COMMON_NAME?.COMMON_NAME.map(
              (name) => name
            ).filter((x) => x !== '')
            const snameList = pest?.SYNONYM_NAME?.SYNONYM_NAME.map(
              (name) => name
            ).filter((x) => x !== '')
            x.PEST_NAME = [
              { type: 'LATIN_NAME', NAME: pest?.LATIN_NAME },
              { type: 'COMMON_NAME', NAME: cnameList },
              { type: 'SYNONYM_NAME', NAME: snameList }
            ]
            x.EPPO_CODE = pest.EPPO_CODE
          }
        })
      })
    })

    // update ResultList with PEST_REG
    resultList.forEach((pl) => {
      plantPestRegList?.forEach((pest) => {
        pl.PEST_LINK?.forEach((x) => {
          if (x?.CSL_REF === pest?.CSL_REF) {
            x.REGULATION = pest?.REGULATION
            x.QUARANTINE_INDICATOR = pest?.QUARANTINE_INDICATOR
            x.REGULATED_INDICATOR = pest?.REGULATED_INDICATOR
          }
        })
      })
    })

    // update PEST Country with PEST_DISTRIBUTION

    const cslRefMap = {}

    resultList.forEach((item) => {
      item.PEST_LINK.forEach((pestLink) => {
        pestDistributionList.forEach((distribution) => {
          if (pestLink.CSL_REF === distribution.CSL_REF) {
            if (!cslRefMap[pestLink.CSL_REF]) {
              cslRefMap[pestLink.CSL_REF] = []
            }
            cslRefMap[pestLink.CSL_REF].push({
              COUNTRY_NAME: distribution.COUNTRY_NAME,
              COUNTRY_CODE: distribution.COUNTRY_CODE,
              STATUS: distribution.STATUS
            })
          }
        })
      })
    })

    // Remove duplicates in the countries array based on country_code
    Object.keys(cslRefMap).forEach((cslRef) => {
      const seen = new Set()
      // eslint-disable-next-line camelcase
      cslRefMap[cslRef] = cslRefMap[cslRef].filter((country) => {
        if (seen.has(country.COUNTRY_CODE)) {
          return false
        } else {
          seen.add(country.COUNTRY_CODE)
          return true
        }
      })
    })

    // Convert the mapping to the desired array of objects format
    const countryResultList = Object.keys(cslRefMap).map((cslRef) => ({
      CSL_REF: parseInt(cslRef),
      // eslint-disable-next-line camelcase
      COUNTRIES: cslRefMap[cslRef]
    }))

    // Map Pest Countries to the resultList
    resultList.forEach((pl) => {
      countryResultList.forEach((pest) => {
        pl.PEST_LINK.forEach((x) => {
          if (x?.CSL_REF === pest?.CSL_REF) {
            x.PEST_COUNTRY = pest?.COUNTRIES
          }
        })
      })
    })

    // Main resultList
    const result = await collectionNew.insertMany(resultList)

    logger.info(`${result.insertedCount} plant documents were inserted...`)
  } catch (err) {
    logger.error(err)
  }
}
export { updateDbPlant }
