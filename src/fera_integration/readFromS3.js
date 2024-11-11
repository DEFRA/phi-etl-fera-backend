import { GetObjectCommand } from '@aws-sdk/client-s3'

async function fetchS3File(request, key, bucket) {
  const s3Client = request.server.s3Client // Accessing s3Client from the server

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  })

  try {
    return await s3Client.send(command)
  } catch (error) {
    request.server.logger.error(
      `Error fetching file ${key} from S3: ${error.message}`
    )
    throw error
  }
}

async function s3FileHandler(request, h, key, bucket) {
  try {
    const s3File = await fetchS3File(request, key, bucket)

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
    return h.response(`Error fetching file: ${error.message}`).code(500)
  }
}

export { s3FileHandler, fetchS3File }
