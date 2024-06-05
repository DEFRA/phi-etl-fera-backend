import { createLogger } from '~/src/helpers/logging/logger'
import { InnsStrategy } from '~/src/strategies/innsStrategy'
import { ProhibitedStrategy } from '~/src/strategies/prohibitedStrategy'

const logger = createLogger()
let strategy = ''
let plantInfo = ''

class workflowStrategyFactory {
  static initateStrategy(searchInput, db) {
    const strategy = kickStart(searchInput, db)
    if (strategy) {
      return strategy
    } else {
      throw new Error('No matching strategy found.')
    }
  }
}

async function kickStart(searchInput, db) {
  logger.info(searchInput)
  // Check if there's an INNS rule for the plant, country and serivce format selected
  // by the user on the frontend. This can be identified by HOST_REF feild in the collection
  // as the data is normalised, we dont have to look into multiple collections
  const plantDocument = await db.collection('PLANT_DATA').findOne({
    HOST_REF: searchInput.plantDetails.hostRef
  })

  if (!plantDocument) {
    logger.info(
      `plant document not found for host_ref:, ${searchInput.plantDetails.hostRef}`
    )
  } else {
    logger.info('trigger - INNS check')
    strategy = new InnsStrategy(plantDocument, searchInput)
    plantInfo = await strategy.execute()

    if (plantInfo.outcome && plantInfo.outcome.length > 0) {
      logger.info(
        `INNS information available for host_ref , ${plantInfo.hostRef}`
      )
      return plantInfo
    }

    logger.info('trigger - prohibited check')
    strategy = new ProhibitedStrategy(plantDocument, searchInput)
    plantInfo = await strategy.execute()

    if (plantInfo.outcome && plantInfo.outcome.length > 0) {
      logger.info(
        `Prohibited information available for host_ref, ${plantInfo.hostRef}`
      )
      return plantInfo
    }
  }
  return false
}

export { workflowStrategyFactory }
