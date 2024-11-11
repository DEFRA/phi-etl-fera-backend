import { writeFile } from 'fs/promises'
import path from 'path'

/**
 * Logs a sample of transformed data and writes the data to a specified file.
 * @param {Array} transformedData - The transformed data to log and write.
 * @param {string} outputFileName - The desired output file name for the data.
 */
export const logAndWriteTransformedData = async (
  transformedData,
  outputFileName
) => {
  try {
    // Log a sample of the transformed data for verification
    // console.log(`Transformed Data Length: ${transformedData.length}`)
    // console.log(`Sample Record: ${JSON.stringify(transformedData[0], null, 2)}`)

    const basePath =
      'C:/Projects/DEFRA/PHI-Beta/FERA Data/API Response/OneDrive_2024-10-31/FERA APIs-3110/'

    // Resolve the output path
    const outputPath = path.resolve(basePath + outputFileName)

    // Write transformed data to file
    await writeFile(
      outputPath,
      JSON.stringify(transformedData, null, 2),
      'utf-8'
    )
    // console.log(`Output successfully written to ${outputPath}`)
  } catch (error) {
    // console.error(`Error writing transformed data to file: ${error.message}`)
  }
}
