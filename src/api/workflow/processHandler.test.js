import { processHandler } from '~/src/api/workflow/processHandler'
import { WorkflowStrategyFactory } from '~/src/factories/workflowStrategyFactory'

jest.mock('~/src/factories/workflowStrategyFactory')

describe('processHandler', () => {
  let requestMock
  let hMock
  let loggerMock
  let wfStrategyMock

  beforeEach(() => {
    loggerMock = { info: jest.fn() }
    requestMock = {
      payload: { some: 'data' },
      logger: loggerMock,
      db: {}
    }
    hMock = {}

    wfStrategyMock = {
      initateStrategy: jest.fn().mockResolvedValue('strategyResult')
    }
    WorkflowStrategyFactory.mockImplementation(() => wfStrategyMock)
  })

  it('should log the request payload and trigger the workflow', async () => {
    const result = await processHandler(requestMock, hMock)

    expect(loggerMock.info).toHaveBeenCalledWith(
      'plant request: [object Object]'
    )
    expect(loggerMock.info).toHaveBeenCalledWith('triggering the workflow...')
    expect(WorkflowStrategyFactory).toHaveBeenCalledWith(loggerMock)
    expect(wfStrategyMock.initateStrategy).toHaveBeenCalledWith(
      requestMock.payload,
      requestMock.db
    )
    expect(result).toBe('strategyResult')
  })

  it('should handle errors gracefully', async () => {
    const error = new Error('Something went wrong')
    wfStrategyMock.initateStrategy.mockRejectedValueOnce(error)

    try {
      await processHandler(requestMock, hMock)
    } catch (e) {
      // expect(e).toBe(error)
    }

    expect(loggerMock.info).toHaveBeenCalledWith(
      'plant request: [object Object]'
    )
    expect(loggerMock.info).toHaveBeenCalledWith('triggering the workflow...')
    expect(WorkflowStrategyFactory).toHaveBeenCalledWith(loggerMock)
    expect(wfStrategyMock.initateStrategy).toHaveBeenCalledWith(
      requestMock.payload,
      requestMock.db
    )
  })
})
