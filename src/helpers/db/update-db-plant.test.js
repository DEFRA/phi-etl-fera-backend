// __tests__/updateDbPlantHandler.test.js

import {
  buildResultList,
  loadCollections,
  mapAnnex11,
  mapAnnex11GrandParent,
  mapAnnex11ParentHost,
  mapAnnex6,
  updateResultListWithAnnex11,
  updateResultListWithAnnex11GrandParent,
  updateResultListWithAnnex11ParentHost
} from './update-db-plant'
import { createLogger } from '~/src/helpers/logging/logger'
import { plantList } from './mocks/plant_name'
import { annex6List } from './mocks/plant_annex6'
import { annex11List } from './mocks/plant_annex11'
import { plantListWithGrandParent } from './mocks/plant_name_grand_parent'

jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn()
}))

const logger = {
  info: jest.fn(),
  error: jest.fn()
}
createLogger.mockReturnValue(logger)

// const mockResponse = {
//   response: jest.fn().mockReturnThis(),
//   code: jest.fn().mockReturnThis()
// }

describe('updateDbPlantHandler', () => {
  let db
  // let request

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      listCollections: jest.fn().mockReturnThis(),
      drop: jest.fn()
    }
    // request = {
    //   server: {
    //     db
    //   }
    // }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('loadData', () => {
    // eslint-disable-next-line jest/no-commented-out-tests
    // it('should return success response when loadData is successful', async () => {
    //   db.collection('PLANT_NAME').find().toArray.mockResolvedValue([])
    //   db.collection('PLANT_ANNEX11').find().toArray.mockResolvedValue([])
    //   db.collection('PLANT_ANNEX6').find().toArray.mockResolvedValue([])
    //   db.collection('PLANT_PEST_LINK').find().toArray.mockResolvedValue([])
    //   db.collection('PLANT_PEST_REG').find().toArray.mockResolvedValue([])
    //   db.collection('PEST_NAME').find().toArray.mockResolvedValue([])
    //   db.collection('PEST_DISTRIBUTION').find().toArray.mockResolvedValue([])
    //   db.listCollections().toArray.mockResolvedValue([])
    //
    //   const h = { ...mockResponse }
    //
    //   await updateDbPlantHandler(request, h)
    //
    //   expect(h.response).toHaveBeenCalledWith({
    //     status: 'success',
    //     message: 'Populate Plant Db successful'
    //   })
    //   expect(h.code).toHaveBeenCalledWith(202)
    // })

    it('should build a lit of collections', async () => {
      db.listCollections().toArray.mockResolvedValue([])

      const collections = await loadCollections(db)
      expect(collections).toEqual({
        plantDocuments: [],
        annex11Documents: [],
        annex6Documents: [],
        plantPestLinkDocuments: [],
        plantPestRegDocuments: [],
        pestNameDocuments: [],
        pestDistributionDocuments: []
      })
    })

    it('should build a plant list', async () => {
      db.listCollections().toArray.mockResolvedValue([])

      const plantListMock = plantList
      const resultList = buildResultList(plantListMock)
      expect(resultList.length).toEqual(3)
    })

    it('should build a Annex6 plant list', async () => {
      db.listCollections().toArray.mockResolvedValue([])
      const plantListMock = plantList
      const resultList = buildResultList(plantListMock)
      const annex6ListMock = annex6List
      const annex6ResultList = mapAnnex6(resultList, annex6ListMock)
      expect(annex6ResultList.length).toEqual(3)
    })

    it('should build a Annex11 plant list - Annex11 Rule_1', async () => {
      const resultList = buildResultList(plantList)
      const annex11ResultList = mapAnnex11(resultList, annex11List)
      expect(annex11ResultList.length).toEqual(3)
      expect(annex11ResultList).toEqual([
        {
          HOST_REF: 381,
          ANNEX11: [
            {
              PLANT: 'Acer L',
              PHI_PLANT: 'Acer',
              FERA_PLANT: 'Acer',
              FERA_PLANT_ID: 380,
              COUNTRY_NAME: 'all',
              'A11 RULE': '11A50',
              INFERRED_INDICATOR: 'y',
              SERVICE_FORMAT: 'Wood',
              SERVICE_SUBFORMAT: '',
              SERVICE_SUBFORMAT_EXCLUDED: 'wood packaging',
              BTOM_CLARIFICATION:
                'where Anolplophora glabripennis not known to be present',
              BTOM_EUSL: '11C',
              BTOM_NON_EUSL: '11B',
              HOST_REF: 381,
              PARENT_HOST_REF: 380
            }
          ]
        },
        { HOST_REF: 2, ANNEX11: [] },
        { HOST_REF: 3, ANNEX11: [] }
      ])
      updateResultListWithAnnex11(resultList, annex11ResultList, [{}, {}])
      expect(resultList[0].HOST_REGULATION.ANNEX11.length).toEqual(3)
      expect(resultList[0].HOST_REGULATION.ANNEX11[0]).toEqual({
        PLANT: 'Acer L',
        PHI_PLANT: 'Acer',
        FERA_PLANT: 'Acer',
        FERA_PLANT_ID: 380,
        COUNTRY_NAME: 'all',
        'A11 RULE': '11A50',
        INFERRED_INDICATOR: 'y',
        SERVICE_FORMAT: 'Wood',
        SERVICE_SUBFORMAT: '',
        SERVICE_SUBFORMAT_EXCLUDED: 'wood packaging',
        BTOM_CLARIFICATION:
          'where Anolplophora glabripennis not known to be present',
        BTOM_EUSL: '11C',
        BTOM_NON_EUSL: '11B',
        HOST_REF: 381,
        PARENT_HOST_REF: 380
      })
    })

    it('should build a Annex11 plant list using PAREN_HOST_REF - Annex11 Rule_2', async () => {
      const resultList = buildResultList(plantList)
      const annex11ResultListParentHost = mapAnnex11ParentHost(
        resultList,
        annex11List
      )
      expect(annex11ResultListParentHost.length).toEqual(3)
      expect(annex11ResultListParentHost).toEqual([
        { HOST_REF: 381, ANNEX11: [] },
        { HOST_REF: 2, ANNEX11: [] },
        {
          HOST_REF: 3,
          ANNEX11: [
            {
              PLANT: 'Acer L',
              PHI_PLANT: 'Acer',
              FERA_PLANT: 'Acer',
              FERA_PLANT_ID: 380,
              COUNTRY_NAME: 'all',
              'A11 RULE': '11A50',
              INFERRED_INDICATOR: 'y',
              SERVICE_FORMAT: 'Wood',
              SERVICE_SUBFORMAT: '',
              SERVICE_SUBFORMAT_EXCLUDED: 'wood packaging',
              BTOM_CLARIFICATION:
                'where Anolplophora glabripennis not known to be present',
              BTOM_EUSL: '11C',
              BTOM_NON_EUSL: '11B',
              HOST_REF: 381,
              PARENT_HOST_REF: 380
            }
          ]
        }
      ])
      // Populate - Annex11
      const annex11ResultList = mapAnnex11(resultList, annex11List)
      updateResultListWithAnnex11(resultList, annex11ResultList, [{}, {}])
      updateResultListWithAnnex11ParentHost(
        resultList,
        annex11ResultListParentHost
      )
      expect(resultList[2].HOST_REGULATION.ANNEX11.length).toEqual(3)
      expect(resultList[2].HOST_REGULATION.ANNEX11[2]).toEqual({
        PLANT: 'Acer L',
        PHI_PLANT: 'Acer',
        FERA_PLANT: 'Acer',
        FERA_PLANT_ID: 380,
        COUNTRY_NAME: 'all',
        'A11 RULE': '11A50',
        INFERRED_INDICATOR: 'y',
        SERVICE_FORMAT: 'Wood',
        SERVICE_SUBFORMAT: '',
        SERVICE_SUBFORMAT_EXCLUDED: 'wood packaging',
        BTOM_CLARIFICATION:
          'where Anolplophora glabripennis not known to be present',
        BTOM_EUSL: '11C',
        BTOM_NON_EUSL: '11B',
        HOST_REF: 381,
        PARENT_HOST_REF: 380
      })
    })

    it('should build a Annex11 plant list using a GRAND_PARENT - Annex11 Rule_3', async () => {
      const resultList = buildResultList(plantList)
      const annex11ResultListGrandParent = mapAnnex11GrandParent(
        resultList,
        plantListWithGrandParent,
        annex11List
      )
      expect(annex11ResultListGrandParent.length).toEqual(1)

      const annex11ResultList = mapAnnex11(resultList, annex11List)
      updateResultListWithAnnex11(resultList, annex11ResultList, [{}, {}])

      const annex11ResultListParentHost = mapAnnex11ParentHost(
        resultList,
        annex11List
      )
      updateResultListWithAnnex11ParentHost(
        resultList,
        annex11ResultListParentHost
      )
      updateResultListWithAnnex11GrandParent(
        resultList,
        annex11ResultListGrandParent
      )
      expect(resultList[2].HOST_REGULATION.ANNEX11.length).toEqual(4)
      expect(resultList[2].HOST_REGULATION.ANNEX11[2]).toEqual(
        {
          PLANT: 'Acer L',
          PHI_PLANT: 'Acer',
          FERA_PLANT: 'Acer',
          FERA_PLANT_ID: 380,
          COUNTRY_NAME: 'all',
          'A11 RULE': '11A50',
          INFERRED_INDICATOR: 'y',
          SERVICE_FORMAT: 'Wood',
          SERVICE_SUBFORMAT: '',
          SERVICE_SUBFORMAT_EXCLUDED: 'wood packaging',
          BTOM_CLARIFICATION:
            'where Anolplophora glabripennis not known to be present',
          BTOM_EUSL: '11C',
          BTOM_NON_EUSL: '11B',
          HOST_REF: 381,
          PARENT_HOST_REF: 380
        },
        {
          PLANT: 'Acer L',
          PHI_PLANT: 'Acer',
          FERA_PLANT: 'Acer',
          FERA_PLANT_ID: 380,
          COUNTRY_NAME: 'all',
          'A11 RULE': '11A50',
          INFERRED_INDICATOR: 'y',
          SERVICE_FORMAT: 'Wood',
          SERVICE_SUBFORMAT: '',
          SERVICE_SUBFORMAT_EXCLUDED: 'wood packaging',
          BTOM_CLARIFICATION:
            'where Anolplophora glabripennis not known to be present',
          BTOM_EUSL: '11C',
          BTOM_NON_EUSL: '11B',
          HOST_REF: 7351,
          PARENT_HOST_REF: 0
        }
      )
    })

    // eslint-disable-next-line jest/no-commented-out-tests
    // it('should return error response when loadData throws an error', async () => {
    //   const error = new Error('Test error')
    //   db.collection('PLANT_NAME').find().toArray.mockRejectedValue(error)
    //
    //   const h = { ...mockResponse }
    //
    //   await updateDbPlantHandler(error, h)
    //
    //   expect(h.code).toHaveBeenCalledWith(202)
    // })
  })
})
