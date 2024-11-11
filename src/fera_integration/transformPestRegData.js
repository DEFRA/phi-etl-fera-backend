import pestRegulationApiSchema from './schema/apiPestRegSchema.js'
import pestRegulationMongoSchema from './schema/plantPestRegSchema.js'
// import { writeFile } from 'fs/promises'
// import path from 'path'

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
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY
  // ============================================================================================

  // // Log the sample of transformed data for verification
  // // console.log(`Transformed Data Length: ${transformedData.length}`)
  // // console.log(`Sample Record: ${JSON.stringify(transformedData[0], null, 2)}`)

  // // Write transformed data to file
  // const outputPath = path.resolve(
  //   'C:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/PestRegulationData-transformed.json'
  // )
  // await writeFile(outputPath, JSON.stringify(transformedData, null, 2), 'utf-8')
  // // console.log(`Output successfully written to ${outputPath}`)
}
