import { ProhibitedStrategy } from './prohibitedStrategy' // Adjust the import path accordingly

import { createLogger } from '~/src/helpers/logging/logger'

jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn().mockReturnValue('In handler %s'),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })
}))

jest.mock('./WorkflowEngine', () => {
  return {
    WorkflowEngine: jest.fn().mockReturnThis()
  }
})

describe('ProhibitedStrategy', () => {
  let loggerMock
  let plantDocumentMock
  let plantNameDocMock
  let searchInputMock
  let countryMappingMock
  let prohibitedStrategy

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation((message) => {
      process.stdout.write(message + '\n')
    })
  })

  beforeEach(async () => {
    loggerMock = createLogger()
    plantDocumentMock = {
      EPPO_CODE: 'E123',
      PLANT_NAME: 'PlantName',
      HOST_REGULATION: {
        ANNEX6: [
          {
            SERVICE_FORMAT: 'plants for planting',
            A6_RULE: 'PROHIBITED',
            COUNTRY_NAME: 'all',
            OVERALL_DECISION: 'prohibited'
          }
        ],
        ANNEX11: []
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
    plantNameDocMock = { HOST_REF: 245 }
    searchInputMock = {
      plantDetails: {
        country: 'country',
        serviceFormat: 'format',
        hostRef: 'ref'
      }
    }
    countryMappingMock = { COUNTRY_NAME: 'country' }

    prohibitedStrategy = await new ProhibitedStrategy(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      loggerMock
    )
  })

  it('should execute and return plant info with annexSixRule and outcome', async () => {
    await ProhibitedStrategy.mockImplementation(() => {
      return {
        loggerMock,
        execute: jest.fn().mockResolvedValue({
          hostRef: '245',
          country: 'specificCountry',
          eppoCode: 'E123',
          plantName: 'PlantName',
          annexSixRule: 'PROHIBITED',
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
          ],
          annex11RulesArr: [],
          isEUSL: false,
          all: false,
          subformat: 'x',
          ProhibitionClarification: '',
          FormatClarification: '',
          hybridIndicator: '',
          dormantIndicator: '',
          seedIndicator: '',
          fruitIndicator: '',
          bonsaiIndicator: '',
          invintroIndicator: ''
        })
      }
    })
    plantNameDocMock = {
      HOST_REF: 245,
      GRAND_PARENT_HOST_REF: 'defaultGrandParentHostRef', // Add default value
      GREAT_GRAND_PARENT_HOST_REF: 'defaultGreatGrandParentHostRef' // Add default value
    }
    // awaitnew WorkflowStrategyFactory(loggerMock);
    prohibitedStrategy = await new ProhibitedStrategy(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      loggerMock
    )
    prohibitedStrategy.serviceFormat = 'plants for planting'
    prohibitedStrategy.country = 'specificCountry'
    const result = await prohibitedStrategy.execute()

    // expect(loggerMock.info).toHaveBeenCalledWith('Check if Annex6 (PROHIBITED) rule applies?');
    // expect(loggerMock.info).toHaveBeenCalledWith('Level 1: Starting INNS check at Region & All level');
    // expect(loggerMock.info).toHaveBeenCalledWith('Inside level 1 INNS check - step 1 ');
    // expect(loggerMock.info).toHaveBeenCalledWith('inside level 1 INNS check - step 2 ');
    // expect(loggerMock.info).toHaveBeenCalledWith('Annex6 (PROHIBITED) rule applicable for \'all\' countries, PROHIBITED');
    // expect(loggerMock.info).toHaveBeenCalledWith('Level 2: Starting INNS check at country level');
    // expect(loggerMock.info).toHaveBeenCalledWith('inside level 2 check block ');
    // expect(loggerMock.info).toHaveBeenCalledWith('Annex6 (PROHIBITED) applicable at country level, PROHIBITED');
    // expect(loggerMock.info).toHaveBeenCalledWith('Annex6 (PROHIBITED) check performed');

    expect(result).toEqual({
      hostRef: '245',
      country: 'specificCountry',
      eppoCode: 'E123',
      plantName: 'PlantName',
      annexSixRule: 'PROHIBITED',
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
      ],
      annex11RulesArr: [],
      isEUSL: false,
      all: false,
      subformat: 'x',
      ProhibitionClarification: '',
      FormatClarification: '',
      hybridIndicator: '',
      dormantIndicator: '',
      seedIndicator: '',
      fruitIndicator: '',
      bonsaiIndicator: '',
      invintroIndicator: ''
    })
  })

  it('should handle no applicable annexSixRule', async () => {
    plantDocumentMock.HOST_REGULATION.ANNEX6 = []
    await ProhibitedStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({
          hostRef: '245',
          country: 'specificCountry',
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
          ],
          annex11RulesArr: [],
          isEUSL: false,
          all: false,
          subformat: 'x',
          ProhibitionClarification: '',
          FormatClarification: '',
          hybridIndicator: '',
          dormantIndicator: '',
          seedIndicator: '',
          fruitIndicator: '',
          bonsaiIndicator: '',
          invintroIndicator: ''
        })
      }
    })
    plantNameDocMock = {
      HOST_REF: 245,
      GRAND_PARENT_HOST_REF: 'defaultGrandParentHostRef', // Add default value
      GREAT_GRAND_PARENT_HOST_REF: 'defaultGreatGrandParentHostRef' // Add default value
    }
    // awaitnew WorkflowStrategyFactory(loggerMock);
    prohibitedStrategy = await new ProhibitedStrategy(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      loggerMock
    )
    prohibitedStrategy.serviceFormat = 'plants for planting'
    prohibitedStrategy.country = 'specificCountry'

    const result = await prohibitedStrategy.execute()
    //   console.log('loggerMock')
    //  console.log(expect(loggerMock.info).toHaveBeenCalledWith('Check if Annex6 (PROHIBITED) rule applies?'))
    // expect(loggerMock.info).toHaveBeenCalledWith('Check if Annex6 (PROHIBITED) rule applies?');
    // expect(loggerMock.info).toHaveBeenCalledWith('Level 1: Starting INNS check at Region & All level');
    // expect(loggerMock.info).toHaveBeenCalledWith('Level 2: Starting INNS check at country level');
    // expect(loggerMock.info).toHaveBeenCalledWith('Annex6 (PROHIBITED) check performed');

    expect(result).toEqual({
      hostRef: '245',
      country: 'specificCountry',
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
      ],
      annex11RulesArr: [],
      isEUSL: false,
      all: false,
      subformat: 'x',
      ProhibitionClarification: '',
      FormatClarification: '',
      hybridIndicator: '',
      dormantIndicator: '',
      seedIndicator: '',
      fruitIndicator: '',
      bonsaiIndicator: '',
      invintroIndicator: ''
    })
  })

  it('should handle prohibitionCheckAtHostRefCountryLevel', async () => {
    plantDocumentMock.HOST_REGULATION.ANNEX6 = [
      {
        HOST_REF: '123',
        PHI_HOST_REF: '123',
        COUNTRY_NAME: 'testCountry',
        SERVICE_FORMAT: 'testFormat',
        OVERALL_DECISION: 'prohibited',
        HYBRID_INDICATOR: '',
        DORMANT_INDICATOR: '',
        SEED_INDICATOR: '',
        FRUIT_INDICATOR: '',
        BONSAI_INDICATOR: '',
        INVINTRO_INDICATOR: '',
        PROHIBITION_CLARIFICATION: '',
        FORMAT_CLARIFICATION: '',
        A6_RULE: 'testRule'
      }
    ]

    const searchInputMock = {
      plantDetails: {
        country: 'testCountry',
        serviceFormat: 'testFormat',
        hostRef: '123'
      }
    }

    ProhibitedStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({
          outcome: 'prohibited',
          hostRef: 'ref',
          country: 'country'
        })
      }
    })
    // await ProhibitedStrategy.mockImplementation(() => {
    //   return {

    //     execute: jest.fn().mockResolvedValue({
    //       loggerMock: {
    //         info: jest.fn().mockReturnValue('Starting Prohibited check at HOST_REF, COUNTRY level')
    //       },
    //       hostRef: '123',
    //       country: 'testCountry',
    //       eppoCode: 'E123',
    //       plantName: 'PlantName',
    //       annexSixRule: 'testRule',
    //       annexElevenRule: '',
    //       outcome: 'prohibited',
    //       pestDetails: [
    //         {
    //           csl_ref: 'CSL123',
    //           name: 'PestName1',
    //           format: 'Format1',
    //           quarantine_indicator: 'R',
    //           regulated_indicator: 'Indicator1',
    //           regulation_category: 'Category1',
    //           pest_country: {
    //             COUNTRY_NAME: 'testCountry',
    //             COUNTRY_STATUS: 'Present'
    //           }
    //         }
    //       ],
    //       annex11RulesArr: [],
    //       isEUSL: false,
    //       all: false,
    //       subformat: 'x',
    //       ProhibitionClarification: '',
    //       FormatClarification: '',
    //       hybridIndicator: '',
    //       dormantIndicator: '',
    //       seedIndicator: '',
    //       fruitIndicator: '',
    //       bonsaiIndicator: '',
    //       invintroIndicator: ''})
    //     }
    //   });
    plantNameDocMock = {
      HOST_REF: 245,
      GRAND_PARENT_HOST_REF: 'defaultGrandParentHostRef', // Add default value
      GREAT_GRAND_PARENT_HOST_REF: 'defaultGreatGrandParentHostRef' // Add default value
    }
    // let factory = await new WorkflowStrategyFactory(loggerMock);
    // factory.initateStrategy(searchInputMock, dbMock)
    // await new WorkflowEngine(
    //   plantDocumentMock,
    //   plantNameDocMock,
    //   searchInputMock,
    //   countryMappingMock,
    //   loggerMock
    // )
    prohibitedStrategy = await new ProhibitedStrategy(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      loggerMock
    )

    prohibitedStrategy.hostRef = '123'
    prohibitedStrategy.country = 'testCountry'
    prohibitedStrategy.serviceFormat = 'testFormat'
    // const result = await prohibitedStrategy.execute()
    // expect(loggerMock?.info).toHaveBeenCalledWith(
    //   'Starting Prohibited check at HOST_REF, COUNTRY level'
    // )
    // expect(result.annexSixRule).toBe('testRule')
  })
})
