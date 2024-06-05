import { config } from '~/src/config'
import { createServer } from '~/src/api/server'
import { createLogger } from '~/src/helpers/logging/logger'
import { populateDb } from '~/src/helpers/db/populate-db'
import { updateDbPlant } from '~/src/helpers/db/update-db-plant'
import { updateDbPest } from '~/src/helpers/db/update-db-pest'

const logger = createLogger()

process.on('unhandledRejection', (error) => {
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exit(1)
})

async function startServer() {
  const server = await createServer()
  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )
  await server.register(populateDb)
  await server.register(updateDbPlant)
  await server.register(updateDbPest)
}

startServer().catch((error) => {
  logger.info('Server failed to start :(')
  logger.error(error)
})
