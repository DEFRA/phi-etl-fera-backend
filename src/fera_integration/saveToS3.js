import { PutObjectCommand } from '@aws-sdk/client-s3'
import s3Client from './config/s3Config'

async function uploadS3File(key, bucket, data, logger) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(data), // Adding the file content
    ContentType: 'application/json' // Specifying content type
  })

  try {
    await s3Client.send(command)
    logger.info(`${key} saved to S3`)
  } catch (error) {
    logger.error(`Error uploading ${key} to S3:`, error.message)
  }
}

export { uploadS3File }
