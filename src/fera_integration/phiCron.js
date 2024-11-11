import { fetchApiData } from './apiClient.js'
import { uploadS3File } from './saveToS3.js'
import { s3FileHandler as readFromS3 } from './readFromS3.js'
import { transformPlantNameData } from './transformPlantNameData.js'
import { transformPestData } from './transformPestNameData.js'
import { transformPestRegulationData } from './transformPestRegData.js'
import { transformPestRiskData } from './transformPestDistData.js'
import { transformPestDocumentsData } from './transformPestDocsData.js'
import { transformPlantPestLinkData } from './transformPlantPestLinkData.js'

// import { insertToMongo } from './insertToMongo.js'
// import cron from 'node-cron'
 
const routes = [
  { route: 'plantNames', collection: 'PLANT_NAME' },
  { route: 'plantPestLink', collection: 'PLANT_PEST_LINK' },
  { route: 'pestNames', collection: 'PEST_NAME' },
  { route: 'pestRisks', collection: 'PEST_DATA' },
  { route: 'pestRegulations', collection: 'PLANT_PEST_REG' },
  { route: 'pestDocuments', collection: 'PEST_DOCUMENT_FCPD' }
]
 
export const runJob = async (request, bucket) => {
  const logger = request.logger
 
  for (const { route } of routes) {
    try {
      // Stage 1: Fetch data from API with circuit breaker
      logger.info(`Invoking FERA API: ${route}`)
      const data = await fetchApiData(route, logger)
      if (!data) throw new Error(`No data received for ${route}`)
      logger.info(`Fetched data successfully for route: ${route}`)
 
      // Stage 2: Transform data with circuit breaker
      logger.info(`Initiating transformation for route: ${route}`)
      let transformedData
      switch (route) {
        case 'plantNames':
          transformedData = await transformPlantNameData(data)
          break
        case 'pestNames':
          transformedData = await transformPestData(data)
          break
        case 'pestRisks':
          transformedData = await transformPestRiskData(data)
          break
        case 'pestRegulations':
          transformedData = await transformPestRegulationData(data)
          break
        case 'pestDocuments':
          transformedData = await transformPestDocumentsData(data)
          break        
        case 'plantPestLink':
          transformedData = await transformPlantPestLinkData(data)
          break
        default:
          throw new Error(`Unknown route: ${route}`)
      }
      if (!transformedData) throw new Error(`Transformation failed for ${route}`)
      logger.info(`Transformation successful for route: ${route}`)
 
      // Stage 3: Save data to S3 with circuit breaker
      logger.info(`Saving to S3 for route: ${route}`)
      await uploadS3File(request, route, bucket, transformedData, logger)
      logger.info(`Data saved to S3 for route: ${route}`)
 
      // // Stage 4: Read data back from S3 with circuit breaker
      // logger.info(`Reading back from S3 for route: ${route}`)
      // const s3Data = await readFromS3(request, route, bucket)
      // if (!s3Data) throw new Error(`Reading from S3 failed for ${route}`)
      // logger.info(`Data read from S3 successfully for route: ${route}`)
 
      // Stage 5: Insert into MongoDB by invoking ETL API's (ETL's need to read the JSON's from S3)
      // await insertToMongo(transformedData, collection)
 
    } catch (error) {
      // Log and skip to the next route on error
      logger.error(`Failed job for ${route}: ${error.message}`)
      continue
    }
  }
}
 
// Schedule job to run every day at midnight
// cron.schedule('0 0 * * *', runJob)
// console.log('Cron job scheduled to run every day at midnight')