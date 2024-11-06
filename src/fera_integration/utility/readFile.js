import fs from 'fs/promises'
import path from 'path'

export const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(path.resolve(filePath), 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // console.error(`Error reading file ${filePath}:`, error.message)
    // throw error
  }
}
