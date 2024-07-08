import { getCountries } from '~/src/api/search/helpers/search-mongodb'

let logger = ''

const countryController = {
  handler: async (request, h) => {
    try {
      logger = request.logger
      const result = await getCountries(logger)
      return h.response({ countries: result }).code(200)
    } catch (error) {
      logger.info(`Failed to fetch countries: ${error.message}`)
      return h.response({ error: 'Failed to fetch countries' }).code(500)
    }
  }
}

export { countryController }
