import pestRiskApiSchema from './schema/apiPestRiskSchema.js'
import pestDistributionMongoSchema from './schema/pestDistSchema.js'
// import { logAndWriteTransformedData } from './utility/dataUtil.js'

const apiToMongoFieldMap = {
  PestRef: 'CSL_REF',
  ArrayRiskCountry: {
    CountryCode: 'COUNTRY_CODE',
    CountryName: 'COUNTRY_NAME',
    RiskCountryStatus: 'STATUS'
  }
}

export const transformPestRiskData = async (data) => {
  const transformedData = await Promise.all(
    data.flatMap((apiItem) => {
      const apiValidated = pestRiskApiSchema
        .load(apiItem)
        .validate()
        .getProperties()
      const distributionRecords = []

      apiValidated.ArrayRiskCountry.forEach((country) => {
        const mongoItem = {}

        mongoItem[apiToMongoFieldMap.PestRef] = apiValidated.PestRef
        mongoItem[apiToMongoFieldMap.ArrayRiskCountry.CountryCode] =
          country.CountryCode || ''
        mongoItem[apiToMongoFieldMap.ArrayRiskCountry.CountryName] =
          country.CountryName || ''
        mongoItem[apiToMongoFieldMap.ArrayRiskCountry.RiskCountryStatus] =
          country.RiskCountryStatus || ''

        // Validate the final mapped object against the MongoDB schema
        const validatedMongoItem = pestDistributionMongoSchema
          .load(mongoItem)
          .validate()
          .getProperties()
        distributionRecords.push(validatedMongoItem)
      })

      return distributionRecords
    })
  )
  return transformedData

  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY, DELETE WHEN DONE
  // ============================================================================================
  // logAndWriteTransformedData(transformedData, PestDistributionData-transformed.json)
}
