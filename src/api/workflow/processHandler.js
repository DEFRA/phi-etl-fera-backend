import { workflowStrategyFactory } from '~/src/factories/workflowStrategyFactory'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

const processHandler = async (request, h) => {
  logger.info(`plant request: ${request.payload}`)
  const data = request.payload
  logger.info(`triggering the workflow...`)
  const strategy = await workflowStrategyFactory.initateStrategy(
    data,
    request.db
  )
  return strategy
}

export { processHandler }
