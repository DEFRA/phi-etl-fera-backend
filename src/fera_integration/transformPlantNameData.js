import apiSchema from './schema/apiPlantNameSchema.js'
import plantSchema from './schema/plantNameSchema.js'
import { writeFile } from 'fs/promises'
import path from 'path'

const apiToMongoFieldMap = {
  HostRef: 'HOST_REF',
  ParentHostRef: 'PARENT_HOST_REF',
  EppoCode: 'EPPO_CODE',
  LatinName: 'LATIN_NAME',
  Kingdom: 'KINGDOM_NAME',
  Phylum: 'PHYLUM_NAME',
  Class: 'CLASS_NAME',
  Category: 'CATEGORY_NAME',
  Order: 'ORDER_NAME',
  Family: 'FAMILY_NAME',
  Subfamily: 'SUBFAMILY_NAME',
  Genus: 'GENUS_NAME',
  Species: 'SPECIES_NAME',
  'TaxonomicLevel (F/G/S)': 'LEVEL_OF_TAXONOMY',
  ArraySynonyms: 'SYNONYM_NAME',
  ArrayCommonNames: 'COMMON_NAME'
}

export const transformPlantNameData = async (data) => {
  // Use Promise.all to handle asynchronous mapping
  const transformedData = await Promise.all(
    data.map(async (apiItem) => {
      const apiValidated = apiSchema.load(apiItem).validate().getProperties()
      const mongoItem = {}

      for (const [apiField, mongoField] of Object.entries(apiToMongoFieldMap)) {
        if (apiField === 'TaxonomicLevel (F/G/S)') {
          mongoItem[mongoField] = apiValidated[apiField]?.charAt(0)
        } else if (apiField === 'ArrayCommonNames') {
          mongoItem[mongoField] = {
            ID: (apiValidated[apiField] || []).map(
              (common) => common.CommonNameId || null
            ),
            NAME: (apiValidated[apiField] || []).map(
              (common) => common.CommonName || ''
            )
          }
        } else if (apiField === 'ArraySynonyms') {
          mongoItem[mongoField] = {
            ID: (apiValidated[apiField] || []).map(
              (syn) => syn.SynonymId || null
            ),
            NAME: (apiValidated[apiField] || []).map(
              (syn) => syn.SynonymName || ''
            )
          }
        } else {
          mongoItem[mongoField] = apiValidated[apiField] || null
        }
      }

      // Validate the final mapped object against the MongoDB schema
      return plantSchema.load(mongoItem).validate().getProperties()
    })
  )
  return transformedData
  
  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY
  // ============================================================================================
  // // Log transformed data length and sample for verification
  // console.log(`Transformed Data Length: ${transformedData.length}`)
  // console.log(`Sample Record: ${JSON.stringify(transformedData[0], null, 2)}`)

  // // Write transformed data to fileC:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/
  // const outputPath = path.resolve('C:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/PlantName-transformed.json')
  // await writeFile(outputPath, JSON.stringify(transformedData, null, 2), 'utf-8')
  // console.log(`Output successfully written to ${outputPath}`)
}
