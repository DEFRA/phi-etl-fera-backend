import {
  buildResultList,
  loadCollections,
  clearCollectionIfExists,
  mapAnnex6,
  mapAnnex11,
  mapPestLink,
  mapAnnex11ParentHost,
  mapAnnex11GrandParent,
  updateResultListWithAnnex6,
  updateResultListWithAnnex11,
  updateResultListWithAnnex11ParentHost,
  updateResultListWithAnnex11GrandParent,
  updateResultListWithPestLink,
  updateResultListWithPestNames,
  updateResultListWithPestReg,
  updateResultListWithPestCountry,
  updateDbPlantHandler,
  insertResultList,
  createMongoDBIndexes
} from './update-db-plant'
import { createLogger } from '~/src/helpers/logging/logger'
import { plantList } from './mocks/plant_name'
import { annex6List } from './mocks/plant_annex6'
import { annex11List } from './mocks/plant_annex11'
import { plantPestLinkList } from './mocks/pest_link'
import { plantListWithGrandParent } from './mocks/plant_name_grand_parent'
import { pestNames } from './mocks/pest_names'
import { plantPestRegList } from './mocks/plant_pest_reg'
import { pestDistributionList } from './mocks/pest_distribution'
import { createTranspiledWorker } from '~/src/helpers/db/update-db-plant-worker'

jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn()
}))
jest.mock('~/src/helpers/db/update-db-plant-worker')
jest.mock('~/src/helpers/db/create-ds-indexes', () => ({
  createMongoDBIndexes: jest.fn()
}))

const logger = {
  info: jest.fn(),
  error: jest.fn()
}
jest.mock('~/src/helpers/logging/logger')

createLogger.mockReturnValue(logger)

describe('updateDbPlantHandler - handler', () => {
  let h

  beforeEach(() => {
    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }
  })

  // eslint-disable-next-line jest/no-disabled-tests

  it('should return 202 when the worker completes successfully', async () => {
    const mockWorker = {
      postMessage: jest.fn(),
      once: jest.fn((event, callback) => {
        if (event === 'message') {
          // eslint-disable-next-line n/no-callback-literal
          setImmediate(() => callback('some data')) // simulate async message
        }
      })
    }

    createTranspiledWorker.mockReturnValue(mockWorker)

    await updateDbPlantHandler.handler({}, h)

    expect(mockWorker.postMessage).toHaveBeenCalledWith('Load plant db data')
    expect(h.response).toHaveBeenCalledWith({
      status: 'success',
      message: 'Populate Plant Db successful'
    })
    expect(h.code).toHaveBeenCalledWith(202)
  })

  it('should return 500 when the worker encounters an error', async () => {
    const mockWorker = {
      postMessage: jest.fn(),
      once: jest.fn((event, callback) => {
        if (event === 'error') {
          setImmediate(() => callback(new Error('Worker error')))
        }
      })
    }

    createTranspiledWorker.mockReturnValue(mockWorker)

    await updateDbPlantHandler.handler({}, h)

    expect(mockWorker.postMessage).toHaveBeenCalledWith('Load plant db data')
    expect(h.response).toHaveBeenCalledWith({
      status: 'error',
      message: 'Worker error'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})

describe('updateDbPlantHandler loadData', () => {
  let db

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      listCollections: jest.fn().mockReturnThis(),
      drop: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('loadData', () => {
    it('should not drop the collection if it does not exist', async () => {
      const collectionName = 'nonExistentCollection'

      await clearCollectionIfExists(db, collectionName)

      expect(logger.info).not.toHaveBeenCalled()
    })

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
      updateResultListWithAnnex6(resultList, annex6ResultList)
      expect(resultList[0].HOST_REGULATION.ANNEX6.length).toEqual(1)
      expect(resultList[0].HOST_REGULATION.ANNEX6[0]).toEqual({
        FERA_PLANT: 'Abies',
        FERA_PLANT_ID: 28,
        COUNTRY_NAME: 'EUROPE_INDICATOR,FALSE',
        A6_RULE: '6A1',
        SERVICE_FORMAT: 'Plants for Planting',
        OVERALL_DECISION: 'Prohibited',
        PROHIBITION_CLARIFICATION: '',
        HYBRID_INDICATOR: '',
        DORMANT_INDICATOR: '',
        SEEDS_INDICATOR: 'x',
        FRUIT_INDICATOR: '',
        BONSAI_INDICATOR: '',
        INVITRO_INDICATOR: '',
        FORMAT_CLARIFICATION: '',
        HOST_REF: 381,
        PARENT_HOST_REF: 28
      })
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

    it('should map pest link list, update pest names and regulations', () => {
      const resultList = buildResultList(plantList)

      const pestLinkResultList = mapPestLink(resultList, plantPestLinkList)
      expect(pestLinkResultList[0].PEST_LINK.length).toEqual(1)
      updateResultListWithPestLink(resultList, pestLinkResultList)
      expect(resultList[0].PEST_LINK?.length).toEqual(1)
      updateResultListWithPestNames(resultList, pestNames)
      expect(resultList[0].PEST_LINK[0]?.PEST_NAME.length).toEqual(3)
      expect(resultList[0].PEST_LINK[0]?.PEST_NAME).toEqual([
        { type: 'LATIN_NAME', NAME: 'Beet curly top virus' },
        {
          type: 'COMMON_NAME',
          NAME: [
            'Beet curly top',
            'Sugarbeet curly top',
            'Sugarbeet curly leaf',
            'Western yellow blight',
            'Tomato yellows',
            'Curly top of beet',
            'Yellows of tomato',
            'Green dwarf of potato'
          ]
        },
        {
          type: 'SYNONYM_NAME',
          NAME: [
            'BCTV',
            'Beet curly top curtovirus',
            'Potato green dwarf virus',
            'Sugarbeet curly leaf virus',
            'Sugarbeet virus 1',
            'Tomato yellows virus',
            'Western yellow blight virus',
            'Beet curly top geminivirus',
            'Beet curly top hybrigeminivirus',
            'Sugarbeet curly-leaf virus',
            'Western yellows blight virus'
          ]
        }
      ])
      updateResultListWithPestReg(resultList, plantPestRegList, plantList)
      expect(resultList[0].PEST_LINK[0].REGULATION_CATEGORY).toEqual(
        'Quarantine pest (Annex 2 part A) - Pests not known to occur in Great Britain'
      )
      expect(resultList[0].PEST_LINK[0].REGULATION_INDICATOR).toEqual('R')
      expect(resultList[0].PEST_LINK[0].QUARANTINE_INDICATOR).toEqual('Q')

      updateResultListWithPestCountry(resultList, pestDistributionList)
      expect(resultList[0].PEST_LINK[0].PEST_COUNTRY.length).toEqual(5)
      expect(resultList[0].PEST_LINK[0].PEST_COUNTRY).toEqual([
        { COUNTRY_NAME: 'Türkiye', COUNTRY_CODE: 'TR', STATUS: 'Present' },
        { COUNTRY_NAME: 'India', COUNTRY_CODE: 'IN', STATUS: 'Present' },
        { COUNTRY_NAME: 'Bolivia', COUNTRY_CODE: 'BO', STATUS: 'Present' },
        { COUNTRY_NAME: 'Canada', COUNTRY_CODE: 'CA', STATUS: 'Present' },
        { COUNTRY_NAME: 'Iran', COUNTRY_CODE: 'IR', STATUS: 'Present' }
      ])
    })
  })
})

describe('insertResultList', () => {
  let db
  let collectionNew
  let resultList

  beforeEach(() => {
    collectionNew = {
      insertMany: jest.fn()
    }
    db = {
      collection: jest.fn().mockReturnValue(collectionNew)
    }
    resultList = [{ plant: 'data1' }, { plant: 'data2' }]

    jest.clearAllMocks()
  })

  it('should insert documents and create indexes', async () => {
    const mockResult = { insertedCount: resultList.length }
    collectionNew.insertMany.mockResolvedValue(mockResult)

    await insertResultList(db, resultList)

    expect(db.collection).toHaveBeenCalledWith('PLANT_DATA')
    expect(collectionNew.insertMany).toHaveBeenCalledWith(resultList)
    // expect(logger?.info).toHaveBeenCalledWith(
    //   `${mockResult.insertedCount} plant documents were inserted...`
    // )
    expect(createMongoDBIndexes).toHaveBeenCalledWith(collectionNew)
  })

  it('should handle insertMany errors', async () => {
    const error = new Error('insertMany failed')
    collectionNew.insertMany.mockRejectedValue(error)

    await expect(insertResultList(db, resultList)).rejects.toThrow(
      'insertMany failed'
    )
    expect(db.collection).toHaveBeenCalledWith('PLANT_DATA')
    expect(collectionNew.insertMany).toHaveBeenCalledWith(resultList)
    expect(logger.info).not.toHaveBeenCalled()
  })
})
