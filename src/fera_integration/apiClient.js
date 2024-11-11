import axios from 'axios'
import https from 'https'
import { config } from '~/src/config/index'

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

export const fetchApiData = async (route, logger) => {
  try {
    logger.info('https Agent values in apiClient: ', httpsAgent)

    logger.info(`Invoked FERA API: ${baseURL}/${route}`)

    const response = await axios.get(`${baseURL}/${route}`, {
      httpsAgent: httpsAgent, // Include the custom HTTPS agent
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    logger.error(`Error fetching data from ${route}:`, error.message)
  }
}
