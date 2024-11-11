import pestRegulationApiSchema from './schema/apiPestRegSchema.js'
import pestRegulationMongoSchema from './schema/plantPestRegSchema.js'
import { logAndWriteTransformedData } from './utility/dataUtil.js'

const apiToMongoFieldMap = {
  PestRef: 'CSL_REF',
  ArrayRegulation: {
    RegulationID: 'REGULATION_ID',
    Regulation: 'REGULATION',
    RegulationCategory: 'REGULATION_CATEGORY',
    RegulationCategoryDescription: 'REGULATION_INDICATOR', // Map description to indicator if needed
    ArrayRegulationHost: {
      HostRef: 'HOST_REF',
      HostFormatId: 'HOST_FORMAT_ID',
      HostFormat: 'HOST_FORMAT'
    }
  }
}

export const transformPestRegulationData = async (data) => {
  const transformedData = await Promise.all(
    data.flatMap((apiItem) => {
      const apiValidated = pestRegulationApiSchema
        .load(apiItem)
        .validate()
        .getProperties()
      const regulationRecords = []

      apiValidated.ArrayRegulation.forEach((regulation) => {
        regulation.ArrayRegulationHost.forEach((host) => {
          const mongoItem = {}

          mongoItem[apiToMongoFieldMap.PestRef] = apiValidated.PestRef
          mongoItem[apiToMongoFieldMap.ArrayRegulation.Regulation] =
            regulation.Regulation
          mongoItem[apiToMongoFieldMap.ArrayRegulation.RegulationCategory] =
            regulation.RegulationCategory
          mongoItem[
            apiToMongoFieldMap.ArrayRegulation.RegulationCategoryDescription
          ] = regulation.RegulationCategoryDescription || ''

          mongoItem[
            apiToMongoFieldMap.ArrayRegulation.ArrayRegulationHost.HostRef
          ] = host.HostRef || null
          mongoItem[
            apiToMongoFieldMap.ArrayRegulation.ArrayRegulationHost.HostFormatId
          ] = host.HostFormatId || null
          mongoItem[
            apiToMongoFieldMap.ArrayRegulation.ArrayRegulationHost.HostFormat
          ] = host.HostFormat || ''

          mongoItem.QUARANTINE_INDICATOR = 'Q' // Static value based on Mongo schema example

          // Validate the final mapped object against the MongoDB schema
          const validatedMongoItem = pestRegulationMongoSchema
            .load(mongoItem)
            .validate()
            .getProperties()
          regulationRecords.push(validatedMongoItem)
        })
      })

      return regulationRecords
    })
  )
  return transformedData
  
  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY, DELETE WHEN DONE
  // ============================================================================================
  // logAndWriteTransformedData(transformedData, PestRegulationData-transformed.json)
}
