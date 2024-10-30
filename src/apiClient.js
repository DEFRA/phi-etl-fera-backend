import axios from 'axios'
import { saveToS3 } from './s3Service.js'

export const callFERAApi = async () => {
  try {
    const options = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer your-token' // Include FERA-specific headers
      }
    }
    const response = await axios('https://fera.api/endpoint', options)

    // Save API response to S3
    await saveToS3('fera-data.json', JSON.stringify(response.data))
  } catch (error) {
    // logger.error('FERA API call failed:', error)
    // throw error // Ensure error is propagated and caught in the cron job
  }
}
