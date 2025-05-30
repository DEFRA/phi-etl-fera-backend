import { searchPlantDetailsDb } from '~/src/api/search/helpers/search-mongodb'

const searchController = {
  handler: async (request, h) => {
    try {
      const searchInput = request.payload // POST
      const extractedText = searchInput.search
      const result = await searchPlantDetailsDb(
        request.db,
        extractedText,
        request.logger
      )
      return h.response({ plant_detail: result }).code(200)
    } catch (error) {
      request.logger.error(
        `Plant search did not yeild results: ${error.message}`
      )
      return h
        .response({ error: 'Plant search did not yeild results' })
        .code(500)
    }
  }
}

export { searchController }
