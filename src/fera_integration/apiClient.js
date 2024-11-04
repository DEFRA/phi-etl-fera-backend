import axios from 'axios'
 
const baseURL = 'https://phis-api-stage.fera.co.uk' // to-be read from config
 
export const fetchApiData = async (route) => {
  try {
    const response = await axios.get(`${baseURL}/${route}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching data from ${route}:`, error.message)
    throw error
  }
}