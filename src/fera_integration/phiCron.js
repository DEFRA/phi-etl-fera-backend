import { fetchApiData } from './apiClient.js'
import { uploadS3File } from './saveToS3.js'
// import { readFromS3 } from './readFromS3.js'
import { transformPlantNameData } from './transformPlantNameData.js'
import { transformPestData } from './transformPestNameData.js'
import { transformPestRegulationData } from './transformPestRegData.js'
import { transformPestRiskData } from './transformPestDistData.js'
import { transformPestDocumentsData } from './transformPestDocsData.js'

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
      logger.info(`Invoking FERA API: pestNames}`)
      const data = await fetchApiData('pestNames', logger)

      // Fetch data from API
      logger.info(`Invoking FERA API: ${route}`)

      logger.info(
        `Invoked successfully, response received for route : ${route}`
      )

      // Transform data
      logger.info(`Transformation API response for route : ${route}`)
      let transformedData

      if (route === 'plantNames') transformedData = transformPlantNameData(data)
      else if (route === 'pestNames') transformedData = transformPestData(data)
      else if (route === 'pestRisks')
        transformedData = transformPestRiskData(data)
      else if (route === 'pestRegulations')
        transformedData = transformPestRegulationData(data)
      else if (route === 'pestDocuments')
        transformedData = transformPestDocumentsData(data)

      logger.info(`Transformed API response for route : ${route}`)

      // Save data to S3
      logger.info(`Saving to S3 for route : ${route}`)
      await uploadS3File(route, bucket, transformedData, logger)
      logger.info(`Saved to S3 for route : ${route}`)

      // Read data back from S3
      // logger.info(`Reading from S3 for route : ${route}`)
      // const s3Data = await readFromS3(route)
      // logger.info(`Read from S3 for route : ${route}`)

      // Insert into MongoDB
      // await insertToMongo(transformedData, collection)
    } catch (error) {
      logger.error(`Failed job for ${route}:`, error.message)
    }
  }
}
// Schedule job to run every day at midnight
// cron.schedule('0 0 * * *', runJob)
// console.log('Cron job scheduled to run every day at midnight')
