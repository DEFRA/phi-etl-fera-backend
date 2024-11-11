import { PutObjectCommand } from '@aws-sdk/client-s3'
import s3Client from './config/s3Config'

async function uploadS3File(key, bucket, data, logger) {
  // const s3Client = s3Client
  logger.info('Inside Save to S3')
  logger.info(bucket)
  logger.info(key)

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(data), // Adding the file content
    ContentType: 'application/json' // Specifying content type
  })

  try {
    await s3Client.send(command)
    logger.info(`File ${key}.json saved to S3 bucket ${bucket}`)
  } catch (error) {
    logger.error(`Error uploading ${key} to S3:`, error.message)
    logger.info(error)
    throw error
  }
}

export { uploadS3File }
