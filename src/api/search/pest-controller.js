import { searchPestDetailsDb } from '~/src/api/search/helpers/search-mongodb'

const pestController = {
  handler: async (request, h) => {
    try {
      const searchInput = request.payload // POST
      const extractedText = searchInput.search
      const result = await searchPestDetailsDb(request.db, extractedText, request.logger)
      return h.response({ pest_detail: result }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestController }
