import { GetObjectCommand } from '@aws-sdk/client-s3'
import s3Client from './config/s3Config'

async function fetchS3File(key, bucket, logger) {
  // const s3Client = s3Client // Accessing s3Client from the server
  logger.info('Inside Read from S3')
  logger.info(bucket)
  logger.info(key)

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  })

  try {
    return await s3Client.send(command)
  } catch (error) {
    logger.error(`Error fetching file ${key} from S3: ${error.message}`)
    logger.info(error)
    throw error
  }
}

async function s3FileHandler(h, key, bucket, logger) {
  try {
    const s3File = await fetchS3File(key, bucket, logger)

    // Check if Body is a readable stream and return it as the response
    if (s3File.Body && typeof s3File.Body.pipe === 'function') {
      return h
        .response(s3File.Body)
        .header('Content-Type', s3File.ContentType)
        .header('Content-Length', s3File.ContentLength)
    }

    // If the Body is not a stream, convert it to a buffer for the response
    const buffer = await s3File.Body?.transformToByteArray()
    return h
      .response(Buffer.from(buffer))
      .header('Content-Type', s3File.ContentType)
      .header('Content-Length', s3File.ContentLength)
  } catch (error) {
    logger.error(`Error fetching file: ${error.message}`)
    logger.info(error)
    throw error
  }
}

export { s3FileHandler, fetchS3File }
