import axios from 'axios'
import https from 'https'
import { config } from '~/src/config/index'

const baseURL = 'https://phis-api-stage.fera.co.uk/api' // to-be read from config
const cert = config.get('fera.cert')
const pwd = config.get('fera.pwd')

const certAscii = Buffer.from(cert, 'base64').toString('ascii') // Decode base64 cert

// Set up HTTPS agent with the certificate and password
const httpsAgent = new https.Agent({
  cert: certAscii, // ASCII format certificate
  passphrase: pwd, // Password if required for the certificate
  rejectUnauthorized: true // Set to true if you need to verify SSL
})

export const fetchApiData = async (route, logger) => {
  try {
    // const baseURL = config.get('api.baseURL') // Read from config

    logger.info(`Invoked FERA API: ${baseURL}/${route}`)
    // const response = await axios.get(`${baseURL}/${route}`)
    const response = await axios.get(`${baseURL}/${route}`, {
      httpsAgent: httpsAgent // Include the custom HTTPS agent
    })

    return response.data
  } catch (error) {
    logger.error(`Error fetching data from ${route}:`, error.message)
  }
}
