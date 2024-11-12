// import axios from 'axios'
import https from 'https'
import { config } from '~/src/config/index'
import { proxyFetch } from '~/src/helpers/proxy-fetch'


// async function getstatus(proxyStatus) {
//   const status = Number(proxyStatus)
//   // Evaluate the response
//   if (status === 200) {
//     return true
//   } else {
//     return false
//   }
// }

export const fetchApiData = async (route, logger) => {
  logger.info('INSIDE API CLIENT')
  const baseURL = config.get('fera.url') // to-be read from config
  const cert = config.get('fera.cert')
  const pwd = config.get('fera.pwd')
  const key = config.get('fera.key')

  const certAscii = Buffer.from(cert, 'base64').toString('ascii') // Decode base64 cert
  const certKey = Buffer.from(key, 'base64').toString('ascii') // Decode base64 key

  // Set up HTTPS agent with the certificate and password
  const httpsAgent = new https.Agent({
    cert: certAscii, // ASCII format certificate
    key: certKey, // ASCII format key
    passphrase: pwd, // Password if required for the certificate
    rejectUnauthorized: true // Set to true if you need to verify SSL
  })

  try {
    logger.info(`Invoked FERA API: ${baseURL}/${route}`)

    const apiResponse = await proxyFetch(`${baseURL}/${route}`, {
      httpsAgent, // Include the custom HTTPS agent
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return apiResponse.data
  } catch (error) {
    logger.error(`Error fetching data from ${route}:`, error.message)
    logger.info(error)
  }
}
