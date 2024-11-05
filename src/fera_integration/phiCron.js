import { fetchApiData } from './apiClient.js'
import { saveToS3 } from './saveToS3.js'
import { readFromS3 } from './readFromS3.js'
import { transformData } from './transformPlantNameData.js'
import { insertToMongo } from './insertToMongo.js'
import cron from 'node-cron'

const routes = [
  { route: 'plantNames', collection: 'PLANT_NAME' },
  { route: 'plantPestLink', collection: 'PLANT_PEST_LINK' },
  { route: 'pestNames', collection: 'PEST_NAME' },
  { route: 'pestRisks', collection: 'PEST_DATA' },
  { route: 'pestRegulations', collection: 'PLANT_PEST_REG' },
  { route: 'pestDocuments', collection: 'PEST_DOCUMENT_FCPD' }
]

const runJob = async () => {
  // for (const { route, collection } of routes) {
  //   try {
  //     // Fetch data from API
  //     const data = await fetchApiData(route)
  
  //     // Save data to S3
  //     await saveToS3(data, route)

  //     // Read data back from S3
  //     const s3Data = await readFromS3(route)

  //     // Transform data
  //     const transformedData = transformData(s3Data)

  //     // Insert into MongoDB
  //     await insertToMongo(transformedData, collection)
  //   } catch (error) {
  //     //  console.error(`Failed job for ${route}:`, error.message)
  //   }

    try {
     

      // Transform data
      const transformedData = transformData(s3Data)

    } catch (error) {
      //  console.error(`Failed job for ${route}:`, error.message)
    }
  }


// Schedule job to run every day at midnight
// cron.schedule('0 0 * * *', runJob)
// console.log('Cron job scheduled to run every day at midnight')
