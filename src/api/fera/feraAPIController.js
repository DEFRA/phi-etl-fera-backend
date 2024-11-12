// import { uploadS3File } from '~/src/fera_integration/saveToS3'
import { config } from '~/src/config/index'
import { runJob } from '~/src/fera_integration/orchestrator'

const feraAPIController = {
  handler: async (request, h) => {
    try {
      const bucket = config.get('s3BucketConfig')
      await runJob(request, bucket, h)
      return h.response('job completed successfully').code(200)
    } catch (error) {
      // request.logger.error(`Failed to fetch countries: ${error.message}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { feraAPIController }
