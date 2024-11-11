import { PutObjectCommand } from '@aws-sdk/client-s3'
// import s3Client from './config/s3Config'

async function uploadS3File(request, key, bucket, data, logger) {
  const s3Client = request.server.s3Client

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: `${key}.json`,
    Body: JSON.stringify(data), // Adding the file content
    ContentType: 'application/json' // Specifying content type
  })

  try {
     await s3Client.send(command)
    logger.info(`File ${key}.json saved to S3 bucket ${bucket}`)
  } catch (error) {
    // console.log(error)
    logger.error(`Error uploading ${key} to S3:`, error.message)
    logger.info( error)
  }
}

export { uploadS3File }
