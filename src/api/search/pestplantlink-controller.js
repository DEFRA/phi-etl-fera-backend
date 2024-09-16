import { getpestplantLink } from '~/src/api/search/helpers/search-mongodb'

const pestplantlinkController = {
  handler: async (request, h) => {
    try {
      const Input = request.payload // POST
      const hostref = Input.hostRefs
      const array1 = hostref
      const array2 = []
      array1.forEach((element) => array2.push(element))

      const result = await getpestplantLink(request.db, array2, request.logger)

      return h.response({ pest_link: result }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestplantlinkController }
