import s3 from '../config/s3Config'
 
export const saveToS3 = async (data, fileName) => {
  const params = {
    Bucket: 'bucket-name',
    Key: `${fileName}.json`,
    Body: JSON.stringify(data),
    ContentType: 'application/json'
  }
 
  try {
    await s3.upload(params).promise()
    console.log(`${fileName} saved to S3`)
  } catch (error) {
    console.error(`Error saving ${fileName} to S3:`, error.message)
  }
}