import { searchPestDetailsDb } from '~/src/api/search/helpers/search-mongodb'
let logger = ''

const pestController = {
  handler: async (request, h) => {
    try {
      logger = request.logger
      const searchInput = request.payload // POST
      const extractedText = searchInput.search
      const result = await searchPestDetailsDb(extractedText, logger)
      return h.response({ pest_detail: result }).code(200)
    } catch (error) {
      // logger.error(`pest search did not yeild results ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestController }
