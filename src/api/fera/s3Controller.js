import { uploadS3File } from '~/src/fera_integration/saveToS3';
import { config } from '~/src/config/index';
 
const s3Controller = {
  handler: async (request, h) => {
    try {
      const bucket = config.get('s3BucketConfig')
      const result = await uploadS3File(request, '~/src/api/data/plants.json', bucket);
      return h.response(result.Body).header('Content-Type', result.ContentType)
    } catch (error) {
      // request.logger.error(`Failed to fetch countries: ${error.message}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}
 
export { s3Controller }