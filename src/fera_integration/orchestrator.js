import { fetchApiData } from './apiClient.js'
import { uploadS3File } from './saveToS3.js'
import { s3FileHandler as readFromS3 } from './readFromS3.js'
import { transformPlantNameData } from './transformPlantNameData.js'
import { transformPestData } from './transformPestNameData.js'
import { transformPestRegulationData } from './transformPestRegData.js'
import { transformPestRiskData } from './transformPestDistData.js'
import { transformPestDocumentsData } from './transformPestDocsData.js'
import { transformPlantPestLinkData } from './transformPlantPestLinkData.js'

const routes = [
  { route: 'plantNames', collection: 'PLANT_NAME' },
  { route: 'plantPestLink', collection: 'PLANT_PEST_LINK' },
  { route: 'pestNames', collection: 'PEST_NAME' },
  { route: 'pestRisks', collection: 'PEST_DATA' },
  { route: 'pestRegulations', collection: 'PLANT_PEST_REG' },
  { route: 'pestDocuments', collection: 'PEST_DOCUMENT_FCPD' }
]

export const runJob = async (request, bucket, h, s3Client) => {
  const logger = request.logger
  logger.info('Inside Orchestrator: ')
  logger.info(bucket)

  for (const { route, collection } of routes) {
    try {
      // Stage 1: Fetch data from API
      logger.info(`Invoking FERA API: ${route}`)
      const data = await fetchApiData(route, logger)

      if (!data) throw new Error(`No data received for ${route}`)
      logger.info(`Fetched data successfully for route: ${route}`)

      // Stage 2: Transform data
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

      if (!transformedData)
        throw new Error(`Transformation failed for ${route}`)
      logger.info(
        `Transformation successful for route: ${route} & ${collection} `
      )

      // Stage 3: Save data to S3
      const s3Key = `${route}.json` // Ensures consistent naming with .json extension
      logger.info(`Saving to S3 for route: ${route}`)
      await uploadS3File(s3Client, s3Key, bucket, transformedData, logger)
      logger.info(`Data saved to S3 for route: ${route}`)

      // Stage 4: Read data back from S3
      logger.info(`Reading back from S3 for route: ${route}`)
      const s3Data = await readFromS3(s3Client, h, s3Key, bucket, logger)
      if (!s3Data) throw new Error(`Reading from S3 failed for ${route}`)
      logger.info(`Data read from S3 successfully for route: ${route}`)

      // Stage 5: Insert into MongoDB by invoking ETL API's (ETLs need to read the JSONs from S3)
      // await insertToMongo(transformedData, collection)
    } catch (error) {
      // Log and skip to the next route on error
      logger.error(`Failed job for ${route}: ${error.message}`)
      continue
    }
  }
}
