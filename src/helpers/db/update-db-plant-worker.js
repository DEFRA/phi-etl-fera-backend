import { parentPort, Worker } from 'worker_threads'
import { createLogger } from '~/src/helpers/logging/logger'
import { loadData } from '~/src/helpers/db/update-db-plant'
import { createSecureContext } from '~/src/helpers/secure-context/secure-context'
import { createMongoClient } from '~/src/helpers/mongodb'
import { config } from '~/src/config'

const logger = createLogger()
const isProduction = config.get('isProduction')
const secureContext = isProduction ? createSecureContext(logger) : undefined

parentPort?.on('message', async (value) => {
  logger.info(`Update db plant worker starting: ${value}`)
  const { db } = await createMongoClient(secureContext, logger)
  await loadData(db)
  parentPort?.postMessage('completed')
  parentPort?.close()
})

function createTranspiledWorker(filename) {
  if (isProduction) {
    return new Worker(filename)
  } else {
    // babel-node doesn't transpile worker_threads so this is to work around it
    const transpile = `
    require('@babel/register');
    require(${JSON.stringify(filename)});
  `
    return new Worker(transpile, { eval: true })
  }
}

export { createTranspiledWorker }
