import pestRiskApiSchema from './schema/apiPestRiskSchema.js'
import pestDistributionMongoSchema from './schema/pestDistSchema.js'
import { writeFile } from 'fs/promises'
import path from 'path'
 
const apiToMongoFieldMap = {
  PestRef: 'CSL_REF',
  ArrayRiskCountry: {
    CountryCode: 'COUNTRY_CODE',
    CountryName: 'COUNTRY_NAME',
    RiskCountryStatus: 'STATUS'
  }
}
 
export const transformPestRiskData = async (data) => {
  const transformedData = await Promise.all(data.flatMap(apiItem => {
    const apiValidated = pestRiskApiSchema.load(apiItem).validate().getProperties()
    const distributionRecords = []
 
    apiValidated.ArrayRiskCountry.forEach(country => {
      const mongoItem = {}
 
      mongoItem[apiToMongoFieldMap.PestRef] = apiValidated.PestRef
      mongoItem[apiToMongoFieldMap.ArrayRiskCountry.CountryCode] = country.CountryCode || ''
      mongoItem[apiToMongoFieldMap.ArrayRiskCountry.CountryName] = country.CountryName || ''
      mongoItem[apiToMongoFieldMap.ArrayRiskCountry.RiskCountryStatus] = country.RiskCountryStatus || ''
 
      // Validate the final mapped object against the MongoDB schema
      const validatedMongoItem = pestDistributionMongoSchema.load(mongoItem).validate().getProperties()
      distributionRecords.push(validatedMongoItem)
    })
 
    return distributionRecords
  }))
 
  // Log a sample of the transformed data for verification
  console.log(`Transformed Data Length: ${transformedData.length}`)
  //console.log(`Sample Record: ${JSON.stringify(transformedData[0], null, 2)}`)
 
  // Write transformed data to file
  const outputPath = path.resolve('C:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/PestDistributionData-transformed.json')
  await writeFile(outputPath, JSON.stringify(transformedData, null, 2), 'utf-8')
  console.log(`Output successfully written to ${outputPath}`)
}