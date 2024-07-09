import { getpestplantLink } from '~/src/api/search/helpers/search-mongodb'
let logger = ''

const pestplantlinkController = {
  handler: async (request, h) => {
    try {
      logger = request.logger

      const Input = request.payload // POST
      const hostref = Input.hostref

      const result = await getpestplantLink(hostref, logger)

      return h.response({ pest_link: result }).code(200)
    } catch (error) {
      // logger.error(`pest search did not yeild results ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestplantlinkController }
