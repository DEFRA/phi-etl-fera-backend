describe('pestDetail configuration', () => {
  it('should validate the configuration schema without errors', () => {
    const config = {
      pestDetail: {
        EPPO_CODE: 'E123',
        GENUS_NAME: 'GenusName',
        CSL_REF: 'CSL123',
        LATIN_NAME: 'LatinName',
        PARENT_CSL_REF: 'ParentCSL123',
        QUARANTINE_INDICATOR: 'Yes',
        REGULATION_CATEGORY: 'Category1',
        REGULATION_INDICATOR: 'Indicator1',
        PEST_NAME: [
          {
            NAME: 'PestName1',
            TYPE: 'Type1'
          },
          {
            NAME: 'PestName2',
            NAME_TYPE: 'NameType2'
          }
        ],
        PLANT_LINK: [
          {
            PLANT_NAME: [
              {
                TYPE: 'Type1',
                NAME: 'PlantName1'
              }
            ],
            HOST_REF: 'HostRef1',
            EPPO_CODE: 'E456',
            HOST_CLASS: 'Class1',
            LATIN_NAME: 'PlantLatinName1',
            PARENT_HOST_REF: 'ParentHostRef1'
          }
        ],
        PEST_COUNTRY_DISTRIBUTION: [
          {
            COUNTRY_CODE: 'US',
            COUNTRY_NAME: 'United States',
            COUNTRY_STATUS: 'Present'
          }
        ],
        PEST_RISK_STATUS: 'High',
        DOCUMENT_LINK: [],
        SPECIES_NAME: 'SpeciesName1',
        TAXONOMY: 'Taxonomy1'
      }
    }

    expect(() => config.pestDetail.validate({ allowed: 'strict' })).toThrow()
  })

  it('should throw an error for invalid configuration', () => {
    const invalidConfig = {
      pestDetail: {
        EPPO_CODE: 123, // Invalid type, should be string
        GENUS_NAME: 'GenusName',
        CSL_REF: 'CSL123',
        LATIN_NAME: 'LatinName',
        PARENT_CSL_REF: 'ParentCSL123',
        QUARANTINE_INDICATOR: 'Yes',
        REGULATION_CATEGORY: 'Category1',
        REGULATION_INDICATOR: 'Indicator1',
        PEST_NAME: [
          {
            NAME: 'PestName1',
            TYPE: 'Type1'
          },
          {
            NAME: 'PestName2',
            NAME_TYPE: 'NameType2'
          }
        ],
        PLANT_LINK: [
          {
            PLANT_NAME: [
              {
                TYPE: 'Type1',
                NAME: 'PlantName1'
              }
            ],
            HOST_REF: 'HostRef1',
            EPPO_CODE: 'E456',
            HOST_CLASS: 'Class1',
            LATIN_NAME: 'PlantLatinName1',
            PARENT_HOST_REF: 'ParentHostRef1'
          }
        ],
        PEST_COUNTRY_DISTRIBUTION: [
          {
            COUNTRY_CODE: 'US',
            COUNTRY_NAME: 'United States',
            COUNTRY_STATUS: 'Present'
          }
        ],
        PEST_RISK_STATUS: 'High',
        DOCUMENT_LINK: [],
        SPECIES_NAME: 'SpeciesName1',
        TAXONOMY: 'Taxonomy1'
      }
    }

    expect(() =>
      invalidConfig.pestDetail.validate({ allowed: 'strict' })
    ).toThrow()
  })
})
