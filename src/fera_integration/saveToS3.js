import { PutObjectCommand } from '@aws-sdk/client-s3'

async function uploadS3File(s3Client, key, bucket, data, logger) {
  logger.info('INSIDE SAVE TO S3')
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
  }
}

export { uploadS3File }
