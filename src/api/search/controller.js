import { searchPlantDetailsDb } from '~/src/api/search/helpers/search-mongodb'
let logger = ''

const searchController = {
  handler: async (request, h) => {
    try {
      logger = request.logger
      const searchInput = request.payload // POST
      const extractedText = searchInput.search
      const result = await searchPlantDetailsDb(extractedText, logger)
      return h.response({ plant_detail: result }).code(200)
    } catch (error) {
      logger.info(`Plant search did not yeild results: ${error.message}`)
      return h.response({ error: 'Plant search did not yeild results' }).code(500)
    }
  }
}

export { searchController }
