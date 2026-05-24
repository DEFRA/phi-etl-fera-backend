import { Worker } from 'worker_threads'
import { config } from '~/src/config'
import { createTranspiledWorker } from './update-db-plant-worker'

jest.mock('worker_threads', () => ({
  Worker: jest.fn(),
  parentPort: {
    on: jest.fn(),
    postMessage: jest.fn(),
    close: jest.fn()
  }
}))

jest.mock('~/src/helpers/logging/logger')
jest.mock('~/src/helpers/db/update-db-plant')
jest.mock('~/src/helpers/secure-context/secure-context')
jest.mock('~/src/helpers/mongodb')
jest.mock('~/src/config')

describe('createTranspiledWorker', () => {
  it('creates a transpiled Worker in development', () => {
    config.get.mockReturnValue(false) // isProduction = false
    createTranspiledWorker('./update-db-plant-worker')

    const transpileCode = `
    require('@babel/register');
    require(${JSON.stringify('./update-db-plant-worker')});
  `
    expect(Worker).toHaveBeenCalledWith(transpileCode, {
      eval: true,
      resourceLimits: { maxOldGenerationSizeMb: 8192 }
    })
  })
})
