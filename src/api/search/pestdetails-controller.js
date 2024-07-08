import { getpestDetails } from '~/src/api/search/helpers/search-mongodb'
let logger = ''

const pestdetailsController = {
  handler: async (request, h) => {
    try {
      logger = request.logger

      const Input = request.payload // POST
      const cslref = Input.pestDetails.cslRef

      const result = await getpestDetails(cslref, logger)

      return h.response({ pest_detail: result }).code(200)
    } catch (error) {
      // logger.error(`pest search did not yeild results ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestdetailsController }
