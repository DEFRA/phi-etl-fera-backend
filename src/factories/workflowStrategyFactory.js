import { InnsStrategy } from '~/src/strategies/innsStrategy'
import { ProhibitedStrategy } from '~/src/strategies/prohibitedStrategy'

let strategy = ''
let plantInfo = ''
let logger = ''

class WorkflowStrategyFactory {
  constructor(cdpLogger) {
    logger = cdpLogger
  }

  initateStrategy(searchInput, db) {
    const strategy = kickStart(searchInput, db)
    if (strategy) {
      return strategy
    } else {
      throw new Error('No matching strategy found.')
    }
  }
}

async function doCountryRegionCheck(db, searchInput) {
  logger.info(`Get the country grouping , ${searchInput.plantDetails.country}`)

  const query = {
    'COUNTRY_GROUPING.COUNTRY_GROUPING': {
      $elemMatch: { COUNTRY_NAME: searchInput.plantDetails.country }
    }
  }

  const countryDetails = await db.collection('COUNTRIES').findOne(query)

  let filteredCountry = ''
  countryDetails?.COUNTRY_GROUPING.COUNTRY_GROUPING.filter((c) => {
    if (
      c.COUNTRY_NAME.toLowerCase() ===
      searchInput.plantDetails.country.toLowerCase()
    ) {
      logger.info(`country item, ${c.COUNTRY_NAME.toLowerCase()}`)
      filteredCountry = c
      return c
    }
    return c
  })

  return filteredCountry
}

async function getRNQPatGenusLevel(latinName, db, searchInput) {
  logger.info(`Get RNQP at Genus Level , ${latinName}`)

  try {
    const words = latinName.split(' ')
    let genusName = ''

    // Check if the latin name as two or more words, we need the first two which corresponds to Genus
    if (words.length >= 2) {
      // get the first 2 words
      genusName = words.slice(0, 2).join(' ')

      // TODO: Collection name to be read from config file
      const collectionPlant = db.collection('PLANT_DATA')

      const cslRefs = await collectionPlant
        .aggregate([
          {
            $match: {
              'PLANT_NAME.type': 'LATIN_NAME',
              'PLANT_NAME.NAME': genusName
            }
          },
          { $unwind: '$PLANT_NAME' },
          {
            $match: {
              'PLANT_NAME.type': 'LATIN_NAME',
              'PLANT_NAME.NAME': genusName
            }
          },
          { $unwind: '$PEST_LINK' },
          { $project: { _id: 0, CSL_REF: '$PEST_LINK.CSL_REF' } }
        ])
        .toArray()

      if (cslRefs !== undefined && cslRefs.length > 0) {
        const pests = await getPests(cslRefs, db, searchInput)
        return pests
      }
    }
  } catch (error) {
    logger.info(`Could not fetch pests at Genus Level ${error}`)
    return error.message
  }
}

async function kickStart(searchInput, db) {
  try {
    logger.info(searchInput)
    // Check if there's an INNS rule for the plant, country and serivce format selected
    // by the user on the frontend. This can be identified by HOST_REF feild in the collection
    // as the data is normalised, we dont have to look into multiple collections
    const plantDocument = await db.collection('PLANT_DATA').findOne({
      HOST_REF: searchInput.plantDetails.hostRef
    })

    if (plantDocument === undefined && !plantDocument) {
      logger.info(
        `Plant document not found for host_ref:, ${searchInput.plantDetails.hostRef}`
      )
      return plantInfo
    } else {
      const countryMapping = await doCountryRegionCheck(db, searchInput)
      logger.info('trigger - INNS check')
      strategy = new InnsStrategy(
        plantDocument,
        searchInput,
        countryMapping,
        logger
      )
      plantInfo = await strategy.execute()

      // If INNS condition applies, return with plant details, dont continue to prohibition checks
      if (plantInfo.outcome && plantInfo.outcome.length > 0) {
        // GET RNQP Pests at Genus Level
        logger.info(
          `INNS rules Applicable for host_ref, country , ${plantInfo.hostRef}, ${plantInfo.country}`
        )
        return plantInfo
      }

      logger.info('trigger - prohibited check')
      strategy = new ProhibitedStrategy(
        plantDocument,
        searchInput,
        countryMapping,
        logger
      )
      plantInfo = await strategy.execute()

      if (plantInfo.outcome && plantInfo.outcome.length > 0) {
        const latinNameObj = plantInfo.plantName.find(
          (item) => item.type === 'LATIN_NAME'
        )
        const latinName = latinNameObj ? latinNameObj.NAME : null
        const pests = await getRNQPatGenusLevel(latinName, db, searchInput)
        plantInfo.pestDetails.push(pests)

        logger.info(
          `PROHIBITED rule Applicable for host_ref, country ${plantInfo.hostRef}, ${plantInfo.country}`
        )
        return plantInfo
      }

      return plantInfo
    }
  } catch (error) {
    logger.error(error)
    throw error
  }
}

async function getPests(cslRefs, db, searchInput) {
  const pestCollection = db.collection('PEST_DATA')
  const cslRefValues = cslRefs.map((item) => item.CSL_REF)

  // Query PEST_DATA collection, for each CSL_REF and input country
  const pestDataResults = await pestCollection
    .aggregate([
      {
        $match: {
          CSL_REF: { $in: cslRefValues },
          'PEST_COUNTRY_DISTRIBUTION.COUNTRY_NAME':
            searchInput.plantDetails.country
        }
      },
      { $unwind: '$PEST_COUNTRY_DISTRIBUTION' },
      {
        $match: {
          'PEST_COUNTRY_DISTRIBUTION.COUNTRY_NAME':
            searchInput.plantDetails.country
        }
      },
      {
        $project: {
          _id: 0,
          csl_ref: '$CSL_REF',
          name: [
            {
              type: 'LATIN_NAME',
              NAME: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$PEST_NAME',
                          as: 'item',
                          cond: { $eq: ['$$item.type', 'LATIN_NAME'] }
                        }
                      },
                      as: 'item',
                      in: '$$item.NAME'
                    }
                  },
                  0
                ]
              }
            },
            {
              type: 'COMMON_NAME',
              NAME: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$PEST_NAME',
                          as: 'item',
                          cond: { $eq: ['$$item.type', 'COMMON_NAME'] }
                        }
                      },
                      as: 'item',
                      in: '$$item.NAME'
                    }
                  },
                  0
                ]
              }
            },
            {
              type: 'SYNONYM_NAME',
              NAME: {
                $map: {
                  input: {
                    $filter: {
                      input: '$PEST_NAME',
                      as: 'item',
                      cond: { $eq: ['$$item.type', 'SYNONYM_NAME'] }
                    }
                  },
                  as: 'item',
                  in: '$$item.NAME'
                }
              }
            }
          ],
          format: {
            FORMAT: '', // "$FORMAT",
            FORMAT_ID: '' // "$FORMAT_ID"
          },
          quarantine_indicator: '$QUARANTINE_INDICATOR',
          regulated_indicator: '$REGULATED_INDICATOR',
          regulation_category: '$REGULATION_CATEGORY',
          pest_country: {
            COUNTRY_NAME: '$PEST_COUNTRY_DISTRIBUTION.COUNTRY_NAME',
            COUNTRY_CODE: '$PEST_COUNTRY_DISTRIBUTION.COUNTRY_CODE',
            STATUS: '$PEST_COUNTRY_DISTRIBUTION.STATUS'
          }
        }
      }
    ])
    .toArray()
  return pestDataResults
}

export { WorkflowStrategyFactory }
