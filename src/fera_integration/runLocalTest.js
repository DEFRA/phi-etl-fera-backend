// TO TEST USING THIS FILE, FOLLOW THESE STEPS:
// 1. Add "type": "module" to package.json
// 2. in the terminal use command node node src/fera_integration/runLocalTest.js

import { readJsonFile } from './utility/readFile.js'
import { transformPlantNameData } from './transformPlantNameData.js'
import { transformPestData } from './transformPestNameData.js'
import { transformPestRegulationData } from './transformPestRegData.js'
import { transformPestRiskData } from './transformPestDistData.js'
import { transformPestDocumentsData } from './transformPestDocsData.js'

import path from 'path'
const filePath =
  'C:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/PLANT_NAME/'
const runLocalTest = async () => {
  try {
    const filePathPlantName = path.resolve(filePath + 'plantNames.json')
    const apiDataPlantName = await readJsonFile(filePathPlantName) // Replace with your actual file path
    await transformPlantNameData(apiDataPlantName)

    const filePathPestName = path.resolve(filePath + 'pestNames.json')
    const apiDataPestName = await readJsonFile(filePathPestName) // Replace with your actual file path
    await transformPestData(apiDataPestName)

    const filePathPestReg = path.resolve(filePath + 'pestRegulations.json')
    const apiDataPestReg = await readJsonFile(filePathPestReg) // Replace with your actual file path
    await transformPestRegulationData(apiDataPestReg)

    const filePathPestRisk = path.resolve(filePath + 'pestRisks.json')
    const apiDataPestRisk = await readJsonFile(filePathPestRisk) // Replace with your actual file path
    await transformPestRiskData(apiDataPestRisk)

    const filePathPestDocs = path.resolve(filePath + 'pestDocuments.json')
    const apiDataPestDocs = await readJsonFile(filePathPestDocs) // Replace with your actual file path
    await transformPestDocumentsData(apiDataPestDocs)
  } catch (error) {
    // console.error('Error during local test run:', error.message)
  }
}

runLocalTest()
