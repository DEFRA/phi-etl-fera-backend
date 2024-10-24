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
  logger?.info(`Get the country grouping , ${searchInput.plantDetails.country}`)

  const query = {
    'COUNTRY_GROUPING.COUNTRY_GROUPING': {
      $elemMatch: { COUNTRY_NAME: searchInput.plantDetails.country }
    }
  }

  const countryDetails = await db.collection('COUNTRIES').findOne(query)
  if (!countryDetails || !countryDetails.COUNTRY_GROUPING) {
    logger?.info(`No country details found for ${searchInput.plantDetails.country}`);
    return null;
  }

  let filteredCountry = ''
  countryDetails?.COUNTRY_GROUPING.COUNTRY_GROUPING.filter((c) => {
    if (
      c.COUNTRY_NAME.toLowerCase() ===
      searchInput.plantDetails.country.toLowerCase()
    ) {
      logger?.info(`country item, ${c.COUNTRY_NAME.toLowerCase()}`)
      filteredCountry = c
      return c
    }
    return c
  })

  return filteredCountry
}

async function kickStart(searchInput, db) {
  try {
    logger?.info(searchInput)
    // Check if there's an INNS rule for the plant, country and serivce format selected
    // by the user on the frontend. This can be identified by HOST_REF feild in the collection
    // as the data is normalised, we dont have to look into multiple collections
    const plantDocument = await db.collection('PLANT_DATA').findOne({
      HOST_REF: searchInput.plantDetails.hostRef
    })
    console.log('plantDOOOOOO', plantDocument)

    // To handle sub-family related conditions, PHIDP-462
    const plantNameDoc = await db.collection('PLANT_NAME').findOne({
      HOST_REF: searchInput.plantDetails.hostRef
    })

    if (plantDocument === undefined && !plantDocument) {
      logger?.info(
        `Plant document not found for host_ref:, ${searchInput.plantDetails.hostRef}`
      )
      return plantInfo
    } else {
      const countryMapping = await doCountryRegionCheck(db, searchInput)
      logger?.info('trigger - INNS check')
      strategy = new InnsStrategy(
        plantDocument,
        plantNameDoc,
        searchInput,
        countryMapping,
        logger
      )
      plantInfo = await strategy.execute()

      if (plantInfo.outcome && plantInfo.outcome.length > 0) {
        logger?.info(
          `INNS rules Applicable for host_ref, country , ${plantInfo.hostRef}, ${plantInfo.country}`
        )
        return plantInfo
      }

      logger?.info('trigger - prohibited check')
      strategy = new ProhibitedStrategy(
        plantDocument,
        plantNameDoc,
        searchInput,
        countryMapping,
        logger
      )
      plantInfo = await strategy.execute()
      console.log('plantInfo', plantInfo)

      if (plantInfo.outcome && plantInfo.outcome.length > 0) {
        logger?.info(
          `Un-Prohibited, Partially-Prohibited or Prohibited rule Applicable for host_ref, country ${plantInfo.hostRef}, ${plantInfo.country}`
        )
        return plantInfo
      }

      return plantInfo
    }
  } catch (error) {
    logger?.error(error)
    throw error
  }
}

export { WorkflowStrategyFactory }
