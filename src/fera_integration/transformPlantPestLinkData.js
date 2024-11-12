import plantPestLinkApiSchema from './schema/apiPlantPestLinkSchema'
import plantPestLinkMongoSchema from './schema/plantPestLinkSchema'
// import { logAndWriteTransformedData } from './utility/dataUtil.js'

const apiToMongoFieldMap = {
  HostRef: 'HOST_REF',
  ArrayHostPest: {
    PestRef: 'CSL_REF'
  }
}

export const transformPlantPestLinkData = async (data) => {
  const transformedData = await Promise.all(
    data.flatMap((apiItem) => {
      const apiValidated = plantPestLinkApiSchema
        .load(apiItem)
        .validate()
        .getProperties()
      const linkRecords = []

      apiValidated.ArrayHostPest.forEach((pest) => {
        const mongoItem = {}

        mongoItem[apiToMongoFieldMap.HostRef] = apiValidated.HostRef
        mongoItem[apiToMongoFieldMap.ArrayHostPest.PestRef] = pest.PestRef

        // Validate the final mapped object against the MongoDB schema
        const validatedMongoItem = plantPestLinkMongoSchema
          .load(mongoItem)
          .validate()
          .getProperties()
        linkRecords.push(validatedMongoItem)
      })

      return linkRecords
    })
  )
  return transformedData

  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY, DELETE WHEN DONE
  // ============================================================================================
  // logAndWriteTransformedData(transformedData, PlantPestLinkData-transformed.json)
}
