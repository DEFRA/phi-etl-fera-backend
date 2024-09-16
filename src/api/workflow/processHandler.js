import { WorkflowStrategyFactory } from '~/src/factories/workflowStrategyFactory'

const processHandler = async (request, h) => {
  request.logger.info(`plant request: ${request.payload}`)
  const data = request.payload
  request.logger.info(`triggering the workflow...`)
  const wfStrategy = new WorkflowStrategyFactory(request.logger)
  const strategy = await wfStrategy.initateStrategy(data, request.db)
  return strategy
}

export { processHandler }
