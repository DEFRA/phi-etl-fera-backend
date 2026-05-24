import { search } from '~/src/api/search/index'
import { searchController } from '~/src/api/search/controller'
import { countryController } from '~/src/api/search/country-controller'
import { pestController } from '~/src/api/search/pest-controller'
import { pestdetailsController } from '~/src/api/search/pestdetails-controller'
import { pestplantlinkController } from '~/src/api/search/pestplantlink-controller'

describe('search plugin', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  it('should register all routes', async () => {
    await search.plugin.register(server)
    expect(server.route).toHaveBeenCalledWith([
      { method: 'POST', path: '/search/plants', ...searchController },
      { method: 'GET', path: '/search/countries', ...countryController },
      { method: 'POST', path: '/search/pests', ...pestController },
      { method: 'POST', path: '/search/pestdetails', ...pestdetailsController },
      { method: 'POST', path: '/search/pestlink', ...pestplantlinkController }
    ])
  })
})
