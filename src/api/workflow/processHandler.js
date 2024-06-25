import { WorkflowStrategyFactory } from '~/src/factories/workflowStrategyFactory'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()
const processHandler = async (request, h) => {
  logger.info(`plant request: ${request.payload}`)
  const data = request.payload
  logger.info(`triggering the workflow...`)
  const wfStrategy = new WorkflowStrategyFactory(logger)
  const strategy = await wfStrategy.initateStrategy(data, request.db)
  return strategy
}

export { processHandler }
