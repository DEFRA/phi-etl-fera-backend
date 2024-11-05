// import AWS from 'aws-sdk'

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: 'aws-region',
//   bucketName: 'bucket-name'
// })

// const s3 = new AWS.S3()
// export default s3

import { S3Client } from '@aws-sdk/client-s3'
import { config } from '~/src/config/index.js'
 

const s3Client = {
  plugin: {
    name: 's3Client',
    version: '0.1.0',
    register(server, options) {
      const client = new S3Client({
        region: options.region,
        endpoint: options.endpoint,
        forcePathStyle: options.forcePathStyle
      })
 
      server.decorate('request', 's3Client', client)
      server.decorate('server', 's3Client', client)
 
      server.events.on('stop', () => {
        server.logger.info('Closing S3 client')
        client.destroy()
      })
    }
  },
  options: {
    region: config.get('aws.region'),
    endpoint: config.get('aws.s3.endpoint'),
    forcePathStyle: config.get('aws.s3.forcePathStyle')
  }
}
 
export { s3Client }