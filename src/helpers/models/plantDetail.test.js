import { plantDetail } from '~/src/api/search/helpers/search-mongodb'

describe('plantDetail configuration', () => {
  it('should validate the configuration schema without errors', () => {
    const config = {
      EPPO_CODE: 'E123',
      GENUS_NAME: 'GenusName',
      HOST_REF: 'HostRef123',
      HOST_REGULATION: {
        ANNEX11: {
          A11_RULE: 'Rule1',
          BTOM: 'BTOM1',
          BTOM_CLARIFICATION: 'Clarification1',
          BTOM_NON_EUSL: 'NonEUSL1',
          COUNTRY_CODE: 'US',
          COUNTRY_NAME: 'United States',
          IMPORT_RULE: 'ImportRule1',
          IMPORT_RULE_NON_EUSL: 'ImportRuleNonEUSL1',
          INFERRED: 'Inferred1',
          SERVICE_FORMAT: 'Format1',
          SERVICE_SUB_FORMAT: 'SubFormat1',
          SERVICE_SUB_FORMAT_EXCLUDED: 'SubFormatExcluded1'
        },
        ANNEX6: {
          A6_RULE: 'Rule6',
          COUNTRY_CODE: 'US',
          COUNTRY_NAME: 'United States',
          FORMAT_CLARIFICATION: 'FormatClarification6',
          FORMAT_EXCLUDED: {
            FORMAT_ID: 'FormatID6',
            FORMAT_NAME: 'FormatName6'
          },
          HYBRID_INDICATOR: 'HybridIndicator6',
          OVERALL_DECISION: 'OverallDecision6',
          PROHIBITION_CLARIFICATION: 'ProhibitionClarification6',
          SERVICE_FORMAT: 'ServiceFormat6'
        }
      },
      LATIN_NAME: 'LatinName',
      PARENT_HOST_REF: 'ParentHostRef123',
      PEST_LINK: [
        {
          PEST_NAME: {
            TYPE: 'Type1',
            NAME: 'PestName1'
          },
          CSL_REF: 'CSLRef1',
          EPPO_CODE: 'E456',
          FORMAT: {
            FORMAT: 'Format1',
            FORMAT_ID: 'FormatID1'
          },
          HOST_CLASS: 'HostClass1',
          LATIN_NAME: 'LatinName1',
          PARENT_CSL_REF: 'ParentCSLRef1',
          PEST_COUNTRY: [
            {
              COUNTRY_CODE: 'US',
              COUNTRY_NAME: 'United States',
              COUNTRY_STATUS: 'Present'
            }
          ],
          REGULATION: 'Regulation1',
          QUARANTINE_INDICATOR: 'Yes',
          REGULATION_INDICATOR: 'Indicator1',
          REGULATION_CATEGORY: 'Category1'
        }
      ],
      PLANT_NAME: [
        {
          NAME: 'PlantName1',
          TYPE: 'Type1'
        },
        {
          NAME: 'PlantName2',
          NAME_TYPE: 'NameType2'
        }
      ],
      SPECIES_NAME: 'SpeciesName1',
      TAXONOMY: 'Taxonomy1',
      LEVEL_OF_TAXONOMY: 'Level1'
    }

    expect(() =>
      plantDetail?.load(config)?.validate({ allowed: 'strict' })
    ).not.toThrow()
  })

  it('should throw an error for invalid configuration', () => {
    const invalidConfig = {
      EPPO_CODE: 123, // Invalid type, should be string
      GENUS_NAME: 'GenusName',
      HOST_REF: 'HostRef123',
      HOST_REGULATION: {
        ANNEX11: {
          A11_RULE: 'Rule1',
          BTOM: 'BTOM1',
          BTOM_CLARIFICATION: 'Clarification1',
          BTOM_NON_EUSL: 'NonEUSL1',
          COUNTRY_CODE: 'US',
          COUNTRY_NAME: 'United States',
          IMPORT_RULE: 'ImportRule1',
          IMPORT_RULE_NON_EUSL: 'ImportRuleNonEUSL1',
          INFERRED: 'Inferred1',
          SERVICE_FORMAT: 'Format1',
          SERVICE_SUB_FORMAT: 'SubFormat1',
          SERVICE_SUB_FORMAT_EXCLUDED: 'SubFormatExcluded1'
        },
        ANNEX6: {
          A6_RULE: 'Rule6',
          COUNTRY_CODE: 'US',
          COUNTRY_NAME: 'United States',
          FORMAT_CLARIFICATION: 'FormatClarification6',
          FORMAT_EXCLUDED: {
            FORMAT_ID: 'FormatID6',
            FORMAT_NAME: 'FormatName6'
          },
          HYBRID_INDICATOR: 'HybridIndicator6',
          OVERALL_DECISION: 'OverallDecision6',
          PROHIBITION_CLARIFICATION: 'ProhibitionClarification6',
          SERVICE_FORMAT: 'ServiceFormat6'
        }
      },
      LATIN_NAME: 'LatinName',
      PARENT_HOST_REF: 'ParentHostRef123',
      PEST_LINK: [
        {
          PEST_NAME: {
            TYPE: 'Type1',
            NAME: 'PestName1'
          },
          CSL_REF: 'CSLRef1',
          EPPO_CODE: 'E456',
          FORMAT: {
            FORMAT: 'Format1',
            FORMAT_ID: 'FormatID1'
          },
          HOST_CLASS: 'HostClass1',
          LATIN_NAME: 'LatinName1',
          PARENT_CSL_REF: 'ParentCSLRef1',
          PEST_COUNTRY: [
            {
              COUNTRY_CODE: 'US',
              COUNTRY_NAME: 'United States',
              COUNTRY_STATUS: 'Present'
            }
          ],
          REGULATION: 'Regulation1',
          QUARANTINE_INDICATOR: 'Yes',
          REGULATION_INDICATOR: 'Indicator1',
          REGULATION_CATEGORY: 'Category1'
        }
      ],
      PLANT_NAME: [
        {
          NAME: 'PlantName1',
          TYPE: 'Type1'
        },
        {
          NAME: 'PlantName2',
          NAME_TYPE: 'NameType2'
        }
      ],
      SPECIES_NAME: 'SpeciesName1',
      TAXONOMY: 'Taxonomy1',
      LEVEL_OF_TAXONOMY: 'Level1'
    }

    expect(() =>
      plantDetail.load(invalidConfig).validate({ allowed: 'strict' })
    ).toThrow()
  })
})
