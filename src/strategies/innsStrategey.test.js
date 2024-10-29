import { InnsStrategy } from '~/src/strategies/innsStrategy'

jest.mock('./workflowEngine', () => {
  return {
    workflowEngine: jest.fn().mockReturnThis()
  }
})

jest.mock('~/src/helpers/logging/logger-options', () => ({
  customLevels: {
    default: 'info',
    levels: {
      info: 30,
      warn: 40,
      error: 50
    }
  }
}))

describe('InnsStrategy', () => {
  let loggerMock
  let dbMock
  let searchInputMock
  let plantDocumentMock
  let plantNameDocMock
  let countryMappingMock
  let cdpLogger
  let innsStrategy

  beforeEach(() => {
    loggerMock = { info: jest.fn(), error: jest.fn() }
    dbMock = {
      collection: jest.fn().mockReturnThis(),
      findOne: jest.fn()
    }

    plantDocumentMock = {
      EPPO_CODE: 'E123',
      PLANT_NAME: 'PlantName',
      HOST_REGULATION: {
        ANNEX6: [
          {
            SERVICE_FORMAT: 'plants for planting',
            A6_RULE: 'INNS',
            COUNTRY_NAME: 'all',
            OVERALL_DECISION: 'prohibited'
          }
        ]
      },
      PEST_LINK: [
        {
          CSL_REF: 'CSL123',
          PEST_NAME: 'PestName1',
          FORMAT: 'Format1',
          QUARANTINE_INDICATOR: 'R',
          REGULATION_INDICATOR: 'Indicator1',
          REGULATION_CATEGORY: 'Category1',
          PEST_COUNTRY: [
            {
              COUNTRY_NAME: 'specificCountry',
              COUNTRY_STATUS: 'Present'
            }
          ]
        }
      ]
    }

    searchInputMock = {
      plantDetails: {
        country: 'country',
        serviceFormat: 'format',
        hostRef: 'ref'
      }
    }
    plantNameDocMock = { HOST_REF: 245 }
    countryMappingMock = { COUNTRY_NAME: 'country' }
    cdpLogger = loggerMock

    dbMock.findOne
      .mockResolvedValueOnce(plantDocumentMock)
      .mockResolvedValueOnce(plantNameDocMock)
      .mockResolvedValueOnce(countryMappingMock)
  })

  it('should execute and return plant info with annexSixRule and outcome', async () => {
    await InnsStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({
          hostRef: 245,
          country: 'country',
          eppoCode: 'E123',
          plantName: 'PlantName',
          annexSixRule: 'INNS',
          annexElevenRule: '',
          outcome: 'prohibited',
          pestDetails: [
            {
              csl_ref: 'CSL123',
              name: 'PestName1',
              format: 'Format1',
              quarantine_indicator: 'R',
              regulated_indicator: 'Indicator1',
              regulation_category: 'Category1',
              pest_country: {
                COUNTRY_NAME: 'specificCountry',
                COUNTRY_STATUS: 'Present'
              }
            }
          ]
        })
      }
    })
    innsStrategy = await new InnsStrategy(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      loggerMock
    )
    innsStrategy.type = 'INNS'
    innsStrategy.decision = 'prohibited'

    innsStrategy.serviceFormat = 'Format1'
    innsStrategy.country = 'specificCountry'

    const result = await innsStrategy.execute()

    //  InnsStrategy.mockResolvedValueOnce(cdpLogger);

    // expect(cdpLogger.info).toHaveBeenCalledWith('Check if Annex6 (INNS) rule applies?');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Level 1: Starting INNS check at Region & All level');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Inside level 1 INNS check - step 1 ');
    // expect(cdpLogger.info).toHaveBeenCalledWith('inside level 1 INNS check - step 2 ');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Annex6 (INNS) rule applicable for \'all\' countries, INNS');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Level 2: Starting INNS check at country level');
    // expect(cdpLogger.info).toHaveBeenCalledWith('inside level 2 check block ');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Annex6 (INNS) applicable at country level, INNS');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Annex6 (INNS) check performed');

    expect(result).toEqual({
      hostRef: 245,
      country: 'country',
      eppoCode: 'E123',
      plantName: 'PlantName',
      annexSixRule: 'INNS',
      annexElevenRule: '',
      outcome: 'prohibited',
      pestDetails: [
        {
          csl_ref: 'CSL123',
          name: 'PestName1',
          format: 'Format1',
          quarantine_indicator: 'R',
          regulated_indicator: 'Indicator1',
          regulation_category: 'Category1',
          pest_country: {
            COUNTRY_NAME: 'specificCountry',
            COUNTRY_STATUS: 'Present'
          }
        }
      ]
    })
  })

  it('should handle no applicable annexSixRule', async () => {
    await InnsStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({
          hostRef: 245,
          country: 'country',
          eppoCode: 'E123',
          plantName: 'PlantName',
          annexSixRule: '',
          annexElevenRule: '',
          outcome: '',
          pestDetails: [
            {
              csl_ref: 'CSL123',
              name: 'PestName1',
              format: 'Format1',
              quarantine_indicator: 'R',
              regulated_indicator: 'Indicator1',
              regulation_category: 'Category1',
              pest_country: {
                COUNTRY_NAME: 'specificCountry',
                COUNTRY_STATUS: 'Present'
              }
            }
          ]
        })
      }
    })
    plantDocumentMock.HOST_REGULATION.ANNEX6 = []

    innsStrategy = await new InnsStrategy(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      cdpLogger
    )
    innsStrategy.serviceFormat = 'Format1'
    innsStrategy.country = 'specificCountry'

    const result = await innsStrategy.execute()

    // expect(cdpLogger.info).toHaveBeenCalledWith('Check if Annex6 (INNS) rule applies?');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Level 1: Starting INNS check at Region & All level');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Level 2: Starting INNS check at country level');
    // expect(cdpLogger.info).toHaveBeenCalledWith('Annex6 (INNS) check performed');

    expect(result).toEqual({
      hostRef: 245,
      country: 'country',
      eppoCode: 'E123',
      plantName: 'PlantName',
      annexSixRule: '',
      annexElevenRule: '',
      outcome: '',
      pestDetails: [
        {
          csl_ref: 'CSL123',
          name: 'PestName1',
          format: 'Format1',
          quarantine_indicator: 'R',
          regulated_indicator: 'Indicator1',
          regulation_category: 'Category1',
          pest_country: {
            COUNTRY_NAME: 'specificCountry',
            COUNTRY_STATUS: 'Present'
          }
        }
      ]
    })
  })
})
