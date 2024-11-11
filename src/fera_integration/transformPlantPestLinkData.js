import plantPestLinkApiSchema from './schema/apiPlantPestLinkSchema'
import plantPestLinkMongoSchema from './schema/plantPestLinkSchema'
import { writeFile } from 'fs/promises'
import path from 'path'
 
const apiToMongoFieldMap = {
  HostRef: 'HOST_REF',
  ArrayHostPest: {
    PestRef: 'CSL_REF'
  }
}

export const transformPlantPestLinkData = async (data) => {
  const transformedData = await Promise.all(data.flatMap(apiItem => {
    const apiValidated = plantPestLinkApiSchema.load(apiItem).validate().getProperties()
    const linkRecords = []
 
    apiValidated.ArrayHostPest.forEach(pest => {
      const mongoItem = {}
 
      mongoItem[apiToMongoFieldMap.HostRef] = apiValidated.HostRef
      mongoItem[apiToMongoFieldMap.ArrayHostPest.PestRef] = pest.PestRef
 
      // Validate the final mapped object against the MongoDB schema
      const validatedMongoItem = plantPestLinkMongoSchema.load(mongoItem).validate().getProperties()
      linkRecords.push(validatedMongoItem)
    })
 
    return linkRecords
  }))
  return transformedData
  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY
  // ============================================================================================
//   const outputData = transformedData
 
//   // Log a sample of the transformed data for verification
//   console.log(`Transformed Data Length: ${transformedData.length}`)
//   console.log(`Sample Record: ${JSON.stringify(transformedData[0], null, 2)}`)
 
//   // Write transformed data to file
//   const outputPath = path.resolve('C:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/PlantPestLinkData-transformed.json')
//   await writeFile(outputPath, JSON.stringify(outputData, null, 2), 'utf-8')
//   console.log(`Output successfully written to ${outputPath}`)
}