// import s3 from './config/s3Config.js'

// export const readFromS3 = async (fileName) => {
//   const params = {
//     Bucket: 'your-bucket-name',
//     Key: `${fileName}.json`
//   }

//   try {
//     const data = await s3.getObject(params).promise()
//     return JSON.parse(data.Body.toString())
//   } catch (error) {
//     // console.error(`Error reading ${fileName} from S3:`, error.message)
//   }
// }

import { GetObjectCommand } from '@aws-sdk/client-s3'

function fetchS3File(request, key, bucket) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  })

  return request.s3Client.send(command)
}

async function s3FileHandler(request, h, path, bucket) {
  const s3File = await fetchS3File(request, path, bucket)

  return h.response(s3File.Body).header('Content-Type', s3File.ContentType)
}

export { s3FileHandler, fetchS3File }
