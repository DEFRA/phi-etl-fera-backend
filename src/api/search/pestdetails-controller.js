import { getpestDetails } from '~/src/api/search/helpers/search-mongodb'


const pestdetailsController = {
  handler: async (request, h) => {
    try {
      const Input = request.payload // POST
      const cslref = Input.pestDetails.cslRef
      const result = await getpestDetails(cslref)
      return h.response({ pest_detail: result }).code(200)
    } catch (error) {      
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { pestdetailsController }
