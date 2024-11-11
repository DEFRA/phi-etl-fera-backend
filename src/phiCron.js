import cron from 'node-cron'
import { callFERAApi } from './apiClient.js'
import { processAndTransform } from './transformService.js'
import { invokeETL } from './etlService.js'

// Function to run the cron job sequentially
const runCronJob = async () => {
  try {
    // logger.info('Cron job started...')

    // Step 1: Call FERA API and save the response in S3
    // logger.info('Step 1: Calling FERA API...')
    await callFERAApi()
    // logger.info('Step 1: FERA API call completed.')

    // Step 2: Process the saved JSON from S3 and transform it for MongoDB
    // logger.info('Step 2: Processing and transforming JSON...')
    await processAndTransform()
    // logger.info('Step 2: JSON processing and transformation completed.')

    // Step 3: Invoke the ETL process to update MongoDB
    // logger.info('Step 3: Invoking ETL process...')
    await invokeETL()
    // logger.info('Step 3: ETL process completed.')

    // logger.info('Cron job completed successfully.')
  } catch (error) {
    // logger.error('Error during cron job execution:', error)
    // Optionally, add logic to handle retries or alerting in case of failure
  }
}

// Schedule the cron job to run at a specific time, e.g., every day at midnight
cron.schedule('0 0 * * *', runCronJob)
