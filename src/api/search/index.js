import { searchController } from '~/src/api/search/controller'
import { countryController } from '~/src/api/search/country-controller'
import { pestController } from '~/src/api/search/pest-controller'
import { pestdetailsController } from '~/src/api/search/pestdetails-controller'

const search = {
  plugin: {
    name: 'search',
    register: async (server) => {
      server.route([
        { method: 'POST', path: '/search/plants', ...searchController },
        {
          method: 'GET',
          path: '/search/countries',
          ...countryController
        },
        {
          method: 'POST',
          path: '/search/pests',
          ...pestController
        },

        {
          method: 'POST',
          path: '/search/pestdetails',
          ...pestdetailsController
        }
      ])
    }
  }
}

export { search }
