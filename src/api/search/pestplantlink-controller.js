import { getpestplantLink } from '~/src/api/search/helpers/search-mongodb'

const pestplantlinkController = {
  handler: async (request, h) => {
    try {
      const Input = request.payload // POST
      const hostref = Input.hostref
      const result = await getpestplantLink(hostref)

      return h.response({ pest_link: result }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestplantlinkController }
