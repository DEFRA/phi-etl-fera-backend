async function searchPlantDetailsDb(db, searchText, logger) {
  // const searchText = searchInput
  const results = []
  try {
    let query = {}
    // TODO: Collection name to be read from config file
    const collectionPlant = db.collection('PLANT_DATA')

    if (searchText) {
      logger?.info(`input text is ${searchText}`)
      query = {
        PLANT_NAME: {
          $elemMatch: { type: 'LATIN_NAME', NAME: new RegExp(searchText, 'i') }
        },
        LEVEL_OF_TAXONOMY: 'S'
      }

      const latinNameResults = await collectionPlant.find(query).toArray()

      if (latinNameResults) {
        const latinArr = []
        // filter latinNameResults and get rid of uncesseary fields
        latinNameResults.map((item) => {
          latinArr.push({
            plantName: item.PLANT_NAME,
            hostRef: item.HOST_REF,
            eppoCode: item.EPPO_CODE
          })
          return latinArr
        })
        results.push({ id: 'latin-name', results: latinArr })
      }

      query = {
        PLANT_NAME: {
          $elemMatch: {
            type: 'COMMON_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        },
        LEVEL_OF_TAXONOMY: 'S'
      }
      const commonNameResults = await collectionPlant.find(query).toArray()

      if (commonNameResults) {
        const commonArr = []
        // filter commonNameResults and get rid of uncesseary fields
        commonNameResults.map((item) => {
          commonArr.push({
            plantName: item.PLANT_NAME,
            hostRef: item.HOST_REF,
            eppoCode: item.EPPO_CODE
          })
          return commonArr
        })
        results.push({ id: 'common-name', results: commonArr })
      }

      query = {
        PLANT_NAME: {
          $elemMatch: {
            type: 'SYNONYM_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        },
        LEVEL_OF_TAXONOMY: 'S'
      }
      const synonymResults = await collectionPlant.find(query).toArray()
      if (synonymResults) {
        const synonymArr = []
        // filter synonymResults and get rid of uncesseary fields
        synonymResults.map((item) => {
          synonymArr.push({
            plantName: item.PLANT_NAME,
            hostRef: item.HOST_REF,
            eppoCode: item.EPPO_CODE
          })
          return synonymArr
        })
        results.push({ id: 'synonym-name', results: synonymArr })
      }
    }

    return results
  } catch (error) {
    logger?.info(`Search query failed ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

async function getCountries(db, logger) {
  try {
    const collectionCountries = db.collection('COUNTRIES')

    // Find the document containing the COUNTRY_GROUPING array
    const result = await collectionCountries.find({}).toArray()
    return result
  } catch (error) {
    logger?.info(`Countries could not be fetched ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

async function searchPestDetailsDb(db, searchText, logger) {
  // const searchText = searchInput
  const results = []
  try {
    let query = {}
    // TODO: Collection name to be read from config file
    const collectionPest = await db.collection('PEST_DATA')

    if (searchText) {
      logger?.info(`input text is ${searchText}`)
      query = {
        PEST_NAME: {
          $elemMatch: { type: 'LATIN_NAME', NAME: new RegExp(searchText, 'i') }
        }
      }

      const latinNameResults = await collectionPest.find(query).toArray()

      if (latinNameResults) {
        const latinArr = []
        // filter latinNameResults and get rid of uncesseary fields
        latinNameResults.map((item) => {
          latinArr.push({
            pestName: item.PEST_NAME,
            cslRef: item.CSL_REF,
            eppoCode: item.EPPO_CODE
          })
          return latinArr
        })
        results.push({ id: 'latin-name', results: latinArr })
      }

      query = {
        PEST_NAME: {
          $elemMatch: {
            type: 'COMMON_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        }
      }
      const commonNameResults = await collectionPest.find(query).toArray()

      if (commonNameResults) {
        const commonArr = []
        // filter commonNameResults and get rid of uncesseary fields
        commonNameResults.map((item) => {
          commonArr.push({
            pestName: item.PEST_NAME,
            cslRef: item.CSL_REF,
            eppoCode: item.EPPO_CODE
          })
          return commonArr
        })
        results.push({ id: 'common-name', results: commonArr })
      }

      query = {
        PEST_NAME: {
          $elemMatch: {
            type: 'SYNONYM_NAME',
            NAME: { $in: [new RegExp(searchText, 'i')] }
          }
        }
      }
      const synonymResults = await collectionPest.find(query).toArray()
      if (synonymResults) {
        const synonymArr = []
        // filter synonymResults and get rid of uncesseary fields
        synonymResults.map((item) => {
          synonymArr.push({
            pestName: item.PEST_NAME,
            cslRef: item.CSL_REF,
            eppoCode: item.EPPO_CODE
          })
          return synonymArr
        })
        results.push({ id: 'synonym-name', results: synonymArr })
      }
    }

    return results
  } catch (error) {
    logger?.info(`Search query failed ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}
async function getpestDetails(db, cslref, logger) {
  try {
    const collectionPestDetails = await db.collection('PEST_DATA')
    // Find the document containing the COUNTRY_GROUPING array
    const result = await collectionPestDetails
      .find({ CSL_REF: cslref })
      .toArray()
    return result
  } catch (error) {
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

async function getpestplantLink(db, hostref, logger) {
  try {
    hostref = hostref.map(Number)
    const collectionPestDetails = await db.collection('PLANT_DATA')
    // Find the document containing the COUNTRY_GROUPING array
    const result = await collectionPestDetails

      .find({ HOST_REF: { $in: hostref } })
      .toArray()
    return result
  } catch (error) {
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

export {
  searchPlantDetailsDb,
  getCountries,
  searchPestDetailsDb,
  getpestDetails,
  getpestplantLink
}
