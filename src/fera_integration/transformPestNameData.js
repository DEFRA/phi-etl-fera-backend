import pestApiSchema from './schema/apiPestNameSchema.js'
import pestMongoSchema from './schema/pestNameSchema.js'
import { logAndWriteTransformedData } from './utility/dataUtil.js'

const apiToMongoFieldMap = {
  PestRef: 'CSL_REF',
  EppoCode: 'EPPO_CODE',
  LatinName: 'LATIN_NAME',
  ArrayPestCommonNames: 'COMMON_NAME',
  ArrayPestSynonyms: 'SYNONYM_NAME'
}

export const transformPestData = async (data) => {
  // Use Promise.all to handle asynchronous mapping
  const transformedData = await Promise.all(
    data.map(async (apiItem) => {
      const apiValidated = pestApiSchema
        .load(apiItem)
        .validate()
        .getProperties()
      const mongoItem = {}

      for (const [apiField, mongoField] of Object.entries(apiToMongoFieldMap)) {
        if (apiField === 'ArrayPestCommonNames') {
          mongoItem[mongoField] = {
            COMMON_NAME_ID: (apiValidated[apiField] || []).map(
              (common) => common.PestCommonNameId || null
            ),
            COMMON_NAME: (apiValidated[apiField] || []).map(
              (common) => common.PestCommonName || ''
            )
          }
        } else if (apiField === 'ArrayPestSynonyms') {
          mongoItem[mongoField] = {
            SYNONYM_NAME_ID: (apiValidated[apiField] || []).map(
              (syn) => syn.SynonymId || null
            ),
            SYNONYM_NAME: (apiValidated[apiField] || []).map(
              (syn) => syn.SynonymName || ''
            )
          }
        } else {
          mongoItem[mongoField] = apiValidated[apiField] || null
        }
      }

      return pestMongoSchema.load(mongoItem).validate().getProperties()
    })
  )

  // Wrap the transformed data in the root structure required by MongoDB
  const outputData = { PEST_NAME: transformedData }
  return outputData

  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY, DELETE WHEN DONE
  // ============================================================================================
  // logAndWriteTransformedData(transformedData, PestData-transformed.json)
}
