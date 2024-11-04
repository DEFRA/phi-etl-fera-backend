import s3 from '../config/s3Config.js'
 
export const readFromS3 = async (fileName) => {
  const params = {
    Bucket: 'your-bucket-name',
    Key: `${fileName}.json`
  }
 
  try {
    const data = await s3.getObject(params).promise()
    return JSON.parse(data.Body.toString())
  } catch (error) {
    console.error(`Error reading ${fileName} from S3:`, error.message)
  }
}