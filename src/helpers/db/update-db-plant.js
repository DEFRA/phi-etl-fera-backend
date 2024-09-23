import { createLogger } from '~/src/helpers/logging/logger'
import { plantDetail } from '~/src/helpers/models/plantDetail'
import { createMongoDBIndexes, runIndexManagement } from '~/src/helpers/db/create-ds-indexes'
import { join } from 'node:path'
import { createTranspiledWorker } from '~/src/helpers/db/update-db-plant-worker'
// import { writeFileSync } from 'fs'

const logger = createLogger()
let isLocked = false

const updateDbPlantHandler = {
  options: {
    timeout: {
      socket: false
    }
  },
  handler: async (request, h) => {
    if (isLocked) {
      return h
        .response({
          status: 'Info',
          message:
            '/updatePlan load in progress, please try again later if required.'
        })
        .code(429)
    }
    isLocked = true

    try {
      const worker = createTranspiledWorker(
        join(__dirname, `/update-db-plant-worker`)
      )
      await new Promise((resolve, reject) => {
        worker.postMessage('Load plant db data')
        worker.once('message', (data) => {
          logger?.info(
            `worker [${worker.threadId}] completed loading plant data - ${data}`
          )
          resolve()
        })
        worker.once('error', (err) => {
          logger?.error(err)
          reject(err)
        })
      })
      return h
        .response({
          status: 'success',
          message: 'Populate Plant Db successful'
        })
        .code(202)
    } catch (error) {
      logger?.error(error)
      return h.response({ status: 'error', message: error.message }).code(500)
    } finally {
      isLocked = false
    }
  }
}

async function loadData(db) {
  try {
    logger?.info('Connected successfully to server')
    const collections = await loadCollections(db)
    const plantDocsFromPlantNameCol = collections.plantDocuments // from PLANT_NAME Collection in DB

    const annex11List = collections.annex11Documents[0]?.PLANT_ANNEX11 || []
    const annex6List = collections.annex6Documents

    // const annex6List = collections.annex6Documents[0]?.PLANT_ANNEX6 || []

    const plantPestLinkList = collections.plantPestLinkDocuments
    const plantPestRegList =
      collections.plantPestRegDocuments[0]?.PLANT_PEST_REG || []
    const pestNamesList = collections.pestNameDocuments[0]?.PEST_NAME || []
    const pestDistributionList =
      collections.pestDistributionDocuments[0]?.PEST_DISTRIBUTION || []

    await clearCollectionIfExists(db, 'PLANT_DATA')
    const plantDocsWithDataFromPlantName = buildResultList(
      plantDocsFromPlantNameCol
    )
    logger.info(
      `plantDocsWithDataMappedFromPlantName: ${plantDocsWithDataFromPlantName.length}`
    )

    // ANNEX 6
    const annex6ResultList = mapAnnex6(
      plantDocsWithDataFromPlantName,
      annex6List
    )
    logger.info('mapAnnex6 completed')

    // ANNEX 11 - For Rule 1
    const annex11ResultList = mapAnnex11(
      plantDocsWithDataFromPlantName,
      annex11List
    )
    logger.info('mapAnnex11 completed')

    // ANNEX 11 - For Rule 2
    const annex11ResultListParentHost = mapAnnex11ParentHost(
      plantDocsWithDataFromPlantName,
      annex11List
    )
    logger.info('mapAnnex11ParentHost completed')

    // ANNEX 11 - For Rule 3 - Find GRANDPARENT
    const annex11ResultListGrandParent = mapAnnex11GrandParent(
      plantDocsWithDataFromPlantName,
      plantDocsFromPlantNameCol,
      annex11List
    )
    logger.info('mapAnnex11GrandParent completed')

    // ----------GREAT GRAND PARENT JIRA STORY PHIDP-462------------------------------
    // ANNEX 11 - For Rule 4 - Find GREAT GRANDPARENT
    const annex11ResultListGreatGrandParent = mapAnnex11GreatGrandParent(
      plantDocsWithDataFromPlantName,
      plantDocsFromPlantNameCol,
      annex11List
    )
    // ----------GREAT GRAND PARENT JIRA STORY PHIDP-462------------------------------
    logger.info('mapAnnex11GreatGrandParent completed')

    const annex11ResultListDefault = annex11List.filter(
      (n11) => +n11.HOST_REF === 99999
    )

    // Map Rule 1(HOST_REF) and Rule 4(DefaultAnnex11)
    updateResultListWithAnnex11(
      plantDocsWithDataFromPlantName,
      annex11ResultList,
      annex11ResultListDefault
    )
    logger.info('updateResultListWithAnnex11 completed')

    // Map Rule 2(PARENT_HOST_REF)
    updateResultListWithAnnex11ParentHost(
      plantDocsWithDataFromPlantName,
      annex11ResultListParentHost
    )
    logger.info('updateResultListWithAnnex11ParentHost completed')

    // Map Rule 3
    updateResultListWithAnnex11GrandParent(
      plantDocsWithDataFromPlantName,
      annex11ResultListGrandParent
    )
    logger.info('updateResultListWithAnnex11GrandParent completed')

    // ----------GREAT GRAND PARENT JIRA STORY PHIDP-462------------------------------
    // Map Rule 4
    updateResultListWithAnnex11GreatGrandParent(
      plantDocsWithDataFromPlantName,
      annex11ResultListGreatGrandParent
    )
    logger.info('updateResultListWithAnnex11GreatGrandParent completed')

    // ----------GREAT GRAND PARENT JIRA STORY PHIDP-462------------------------------

    updateResultListWithAnnex6(plantDocsWithDataFromPlantName, annex6ResultList)
    logger.info('updateResultListWithAnnex6 completed')

    const pestLinkResultList = mapPestLink(
      plantDocsWithDataFromPlantName,
      plantPestLinkList
    )
    logger.info(`mapPestLink: ${pestLinkResultList.length}`)
    updateResultListWithPestLink(
      plantDocsWithDataFromPlantName,
      pestLinkResultList
    )
    logger.info('updateResultListWithPestLink completed')

    updateResultListWithPestNames(plantDocsWithDataFromPlantName, pestNamesList)
    logger.info('updateResultListWithPestNames completed')

    updateResultListWithPestReg(
      plantDocsWithDataFromPlantName,
      plantPestRegList,
      plantDocsFromPlantNameCol
    )
    logger.info('updateResultListWithPestReg completed')

    updateResultListWithPestCountry(
      plantDocsWithDataFromPlantName,
      pestDistributionList
    )
    logger.info('updateResultListWithPestCountry completed')

    await insertResultList(db, plantDocsWithDataFromPlantName)
    logger.info('insertResultList completed')
  } catch (err) {
    logger?.error(err)
  }
}

async function loadCollections(db) {
  logger.info('loading of MASTER collections from DB STARTED')
  logger.info(
    'PLANT_NAME, PLANT_ANNEX11, PLANT_ANNEX6, PLANT_PEST_LINK, PLANT_PEST_REG, PEST_NAME, PEST_DISTRIBUTION '
  )
  const collections = {}
  collections.plantDocuments = await db
    .collection('PLANT_NAME')
    .find({})
    .toArray()
  collections.annex11Documents = await db
    .collection('PLANT_ANNEX11')
    .find({})
    .toArray()
  collections.annex6Documents = await db
    .collection('PLANT_ANNEX6')
    .find({})
    .toArray()
  collections.plantPestLinkDocuments = await db
    .collection('PLANT_PEST_LINK')
    .find({})
    .toArray()
  collections.plantPestRegDocuments = await db
    .collection('PLANT_PEST_REG')
    .find({})
    .toArray()
  collections.pestNameDocuments = await db
    .collection('PEST_NAME')
    .find({})
    .toArray()
  collections.pestDistributionDocuments = await db
    .collection('PEST_DISTRIBUTION')
    .find({})
    .toArray()

  logger.info('loading of collections from DB COMPLETED')
  return collections
}

async function clearCollectionIfExists(db, collectionName) {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray()
  if (collections?.length > 0) {
    await db.collection(collectionName).drop()
    logger.info(`Collection ${collectionName} dropped.`)
  }
}

function buildResultList(plantNameDocsFromDB) {
  logger.info(
    'get the plant structure from CONVICT PLANTDETAIL, and map values from from PLANT_NAME into it'
  )
  return plantNameDocsFromDB.map((plant) => {
    const plDetail = plantDetail.get('plantDetail')
    plDetail.EPPO_CODE = plant?.EPPO_CODE
    plDetail.HOST_REF = plant?.HOST_REF
    plDetail.TAXONOMY = plant?.TAXONOMY
    plDetail.PARENT_HOST_REF = plant?.PARENT_HOST_REF
    plDetail.LEVEL_OF_TAXONOMY = plant?.LEVEL_OF_TAXONOMY
    plDetail.PLANT_NAME = [
      { type: 'LATIN_NAME', NAME: plant?.LATIN_NAME },
      {
        type: 'COMMON_NAME',
        NAME: plant?.COMMON_NAME?.NAME.filter((name) => name !== '')
      },
      {
        type: 'SYNONYM_NAME',
        NAME: plant?.SYNONYM_NAME?.NAME.filter((name) => name !== '')
      }
    ]

    return plDetail
  })
}

// get all the matching entries from annex6 for the matching host_ref from PLANT_DATA
function mapAnnex6(docsFromPlantDataCol, annex6List) {
  return docsFromPlantDataCol.map((plantDoc) => {
    const nx6List = annex6List.filter((n6) => n6.HOST_REF === plantDoc.HOST_REF)
    return { HOST_REF: plantDoc.HOST_REF, ANNEX6: nx6List }
  })
}

// get all the matching entries from annex11 for the matching host_ref from PLANT_DATA
function mapAnnex11(docsFromPlantDataCol, annex11List) {
  return docsFromPlantDataCol.map((plant) => {
    const nx11List = annex11List.filter(
      (n11) => +n11.HOST_REF === +plant.HOST_REF
    )
    return { HOST_REF: plant.HOST_REF, ANNEX11: nx11List }
  })
}

// Rule 1(Annex11 rules for matching HOST_REF) and Rule 4(DefaultAnnex11 if no matching HOST_REF)
function updateResultListWithAnnex11(
  docsFromPlantDataCol,
  annex11ResultList,
  annex11ResultListDefault
) {
  docsFromPlantDataCol.forEach((plant) => {
    annex11ResultList.forEach((nx11) => {
      if (plant.HOST_REF === nx11.HOST_REF) {
        plant.HOST_REGULATION.ANNEX11 = [
          ...nx11.ANNEX11,
          ...annex11ResultListDefault
        ]
      } else if (plant.HOST_REGULATION.ANNEX11.length === 0) {
        plant.HOST_REGULATION.ANNEX11 = annex11ResultListDefault
      }
    })
  })
}

// ANNEX11 - Rule 2 - using PARENT_HOST_REF
function mapAnnex11ParentHost(docsFromPlantName, annex11List) {
  logger.info('mapAnnex11ParentHost started...')
  return docsFromPlantName.map((plantDocs) => {
    const nx11List = annex11List.filter(
      (nx11) => +nx11.HOST_REF === +plantDocs.PARENT_HOST_REF
    )
    return { HOST_REF: plantDocs.HOST_REF, ANNEX11: nx11List }
  })
}

// ANNEX11 Rule 3 - Find a matching HOST_REF (FAMILY) in PLANT_NAME Collection from PLANT_DATA using PARENT_HOST_REF
function mapAnnex11GrandParent(
  docsMappedWithPlantNameData,
  docsFromPlantNameCol,
  annex11List
) {
  logger.info('mapAnnex11GrandParent started...')
  // eslint-disable-next-line array-callback-return
  const resultListGrandParent = docsMappedWithPlantNameData
    .map((plantDocs) => {
      const matchingElement = docsFromPlantNameCol.find(
        (pl) => +pl.HOST_REF === +plantDocs.PARENT_HOST_REF
      )
      if (matchingElement) {
        return {
          ...matchingElement,
          HOST_CHILD_REF: plantDocs.HOST_REF
        }
      }
      return null
    })
    .filter((element) => element !== undefined && element !== null)
  return resultListGrandParent.map((rl) => {
    const nx11ListParent = annex11List
      .filter((nx11) => +rl.PARENT_HOST_REF === +nx11.HOST_REF)
      .filter((x) => x.HOST_REF !== null)
    return { HOST_REF: rl.HOST_CHILD_REF, ANNEX11: nx11ListParent }
  })
}

// MAP ANNEX11 Rule 2
function updateResultListWithAnnex11ParentHost(
  plantDocuments,
  annex11ResultListParentHost
) {
  logger.info('updateResultListWithAnnex11ParentHost started...')
  plantDocuments.forEach((plant) => {
    annex11ResultListParentHost.forEach((nx11) => {
      if (plant.HOST_REF === nx11.HOST_REF) {
        plant.HOST_REGULATION.ANNEX11 = [
          ...plant.HOST_REGULATION.ANNEX11,
          ...nx11.ANNEX11
        ]
      }
    })
  })
}

// MAP ANNEX11 Rule 3
function updateResultListWithAnnex11GrandParent(
  plantDocuments,
  annex11ResultListGrandParent
) {
  logger.info('updateResultListWithAnnex11GrandParent started...')
  plantDocuments.forEach((plant) => {
    annex11ResultListGrandParent.forEach((nx11) => {
      if (plant.HOST_REF === nx11.HOST_REF) {
        plant.HOST_REGULATION.ANNEX11 = [
          ...plant.HOST_REGULATION.ANNEX11,
          ...nx11.ANNEX11
        ]
      }
    })
  })

}

// ----------GREAT GRAND PARENT JIRA STORY PHIDP-462------------------------------
// MAP ANNEX11 Rule 4
function mapAnnex11GreatGrandParent(
  docsMappedWithPlantNameData,
  docsFromPlantNameCol,
  annex11List
) {
  logger.info('mapAnnex11GreatGrandParent started...')

  // Logic: When compared to mapAnnex11GrandParent, this function reverses the mapping, the comparison
  // is done agains the PLANT_NAME collection, as docsMappedWithPlantNameData does not have GRAND_PARENT_HOST_REF

  /*
    // The sub-family introduction is recent, retain the below for testing, once stable delete
    writeFileSync('docsMappedWithPlantNameData.json', JSON.stringify(docsMappedWithPlantNameData, null, 2))
    writeFileSync('docsFromPlantNameCol.json', JSON.stringify(docsFromPlantNameCol, null, 2))
    writeFileSync('annex11List.json', JSON.stringify(annex11List, null, 2))
  */

  // Filter for valid entries and map the result
  const resultListGreatGrandParent = docsFromPlantNameCol
    .map((plantName) => {
      // Only process records where GRAND_PARENT_HOST_REF is not null or undefined
      if (plantName.GRAND_PARENT_HOST_REF) {
        // Find the matching element in PLANT_NAME collection
        const matchingElement = docsMappedWithPlantNameData.find(
          (mappedPlantName) =>
            mappedPlantName.HOST_REF.toString() ===
            plantName.GRAND_PARENT_HOST_REF.toString()
        )
        // If a matching element is found, return the combined object
        if (matchingElement) {
          return {
            ...matchingElement,
            HOST_CHILD_REF: plantName.HOST_REF // Track child HOST_REF
          }
        }
      }
      return null // Return null if no match or GRAND_PARENT_HOST_REF is invalid
    })
    .filter((element) => element !== null) // Filter out null entries

  // The sub-family introduction is recent, retain the below for testing, once stable delete
  // Write the resultListGreatGrandParent to a JSON file
  // writeFileSync('greatgrandplantcol.json', JSON.stringify(resultListGreatGrandParent, null, 2))
  // logger.info('resultListGreatGrandParent list written to greatgrandplantcol.json')

  // Now map the filtered results and associate with ANNEX11 data
  const resultWithAnnex11 = resultListGreatGrandParent.map((rl) => {
    const nx11ListParent = annex11List
      .filter(
        (nx11) => rl.PARENT_HOST_REF.toString() === nx11.HOST_REF.toString()
      ) // Filter by PARENT_HOST_REF
      .filter((x) => x.HOST_REF !== null) // Ensure valid HOST_REF
    // Return the ANNEX11 rules associated with the HOST_REF of the child
    return { HOST_REF: rl.HOST_CHILD_REF, ANNEX11: nx11ListParent }
  })

  // The sub-family introduction is recent, retain the below for testing, once stable delete
  // Write the resultWithAnnex11 to a JSON file
  // writeFileSync('greatgrandparentList.json', JSON.stringify(resultWithAnnex11, null, 2))
  // logger.info('Great Grandparent list written to greatgrandparentList.json')

  return resultWithAnnex11
}

function updateResultListWithAnnex11GreatGrandParent(
  plantDocuments,
  annex11ResultListGreatGrandParent
) {
  logger.info('updateResultListWithAnnex11GreatGrandParent started...')
  plantDocuments.forEach((plantDoc) => {
    annex11ResultListGreatGrandParent.forEach((annex11) => {
      if (plantDoc.HOST_REF === annex11.HOST_REF) {
        plantDoc.HOST_REGULATION.ANNEX11 = [
          ...plantDoc.HOST_REGULATION.ANNEX11,
          ...annex11.ANNEX11
        ]
      }
    })
  })
}
// ----------GREAT GRAND PARENT JIRA STORY PHIDP-462------------------------------

function updateResultListWithAnnex6(plantDocuments, annex6ResultList) {
  logger.info('updateResultListWithAnnex6 started...')
  plantDocuments.forEach((x) => {
    annex6ResultList.forEach((nx6) => {
      if (x.HOST_REF === nx6.HOST_REF) {
        x.HOST_REGULATION.ANNEX6 = nx6.ANNEX6
      }
    })
  })
}

function mapPestLink(plantDocuments, plantPestLinkList) {
  logger.info('mapPestLink started...')
  return plantDocuments.map((plantItem) => {
    const pplList = plantPestLinkList
      .filter((cListItem) => cListItem.HOST_REF === plantItem.HOST_REF)
      .map((cListItem) => ({
        CSL_REF: cListItem.CSL_REF,
        HOST_CLASS: cListItem.HOST_CLASS,
        PEST_NAME: { TYPE: '', NAME: '' },
        EPPO_CODE: '',
        FORMAT: { FORMAT: '', FORMAT_ID: '' },
        LATIN_NAME: '',
        PARENT_CSL_REF: '',
        PEST_COUNTRY: [
          { COUNTRY_CODE: '', COUNTRY_NAME: '', COUNTRY_STATUS: '' }
        ],
        REGULATION: '',
        REGULATION_CATEGORY: '',
        QUARANTINE_INDICATOR: '',
        REGULATION_INDICATOR: ''
      }))

    return {
      HOST_REF: plantItem.HOST_REF,
      PEST_LINK: pplList
    }
  })
}

function updateResultListWithPestLink(plantDocuments, pestLinkResultList) {
  logger.info('updateResultListWithPestLink started...')
  plantDocuments.forEach((x) => {
    pestLinkResultList.forEach((pest) => {
      if (x?.HOST_REF === pest?.HOST_REF) {
        x.PEST_LINK = pest?.PEST_LINK
      }
    })
  })
}

function updateResultListWithPestNames(plantDocuments, pestNamesList) {
  logger.info('updateResultListWithPestNames started...')
  plantDocuments.forEach((pl) => {
    pestNamesList.forEach((pest) => {
      pl.PEST_LINK?.forEach((x) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.PEST_NAME = [
            { type: 'LATIN_NAME', NAME: pest?.LATIN_NAME },
            {
              type: 'COMMON_NAME',
              NAME: pest?.COMMON_NAME?.COMMON_NAME.filter((name) => name !== '')
            },
            {
              type: 'SYNONYM_NAME',
              NAME: pest?.SYNONYM_NAME?.SYNONYM_NAME.filter(
                (name) => name !== ''
              )
            }
          ]
          x.EPPO_CODE = pest?.EPPO_CODE
        }
      })
    })
  })
}

function updateResultListWithPestReg(
  plantDocuments,
  plantPestRegList,
  plantDocsFromDB
) {
  logger.info('updateResultListWithPestReg started...')
  const pestRegResultListGrandParent = pestRegParentListresultList(
    plantDocuments,
    plantPestRegList,
    plantDocsFromDB
  )
  //* ******************for each plant data record - rl */
  plantDocuments.forEach((rl) => {
    //* ******************for the plant data record picking up each pest link data */
    rl.PEST_LINK?.forEach((rlPestLink) => {
      //* ******************picking up each pest regulation data */
      plantPestRegList.forEach((pest) => {
        //* ******************matching CSL_REF from plant data -> pest link with pest regulation CSL_REF   */
        if (rlPestLink?.CSL_REF === pest?.CSL_REF) {
          //* ****************** for the matching pest in pest regulation if quarantine indicator is in Q and P update the regulation values  */
          if (
            ['Q', 'P'].includes(pest?.QUARANTINE_INDICATOR)
            //* *************** commneted 2 lines ****************&&
            // rlPestLink.QUARANTINE_INDICATOR === ''
          ) {
            rlPestLink.REGULATION = pest?.REGULATION
            rlPestLink.QUARANTINE_INDICATOR = pest?.QUARANTINE_INDICATOR
            rlPestLink.REGULATION_INDICATOR = pest?.REGULATION_INDICATOR
            rlPestLink.REGULATION_CATEGORY = pest?.REGULATION_CATEGORY
            //* ****************** if not Q & P then check the host_ref of plant data with pest regulation data and qurantine indicator as R  */
          } else if (
            pest?.QUARANTINE_INDICATOR === 'R' &&
            (rl?.HOST_REF === pest?.HOST_REF ||
              rl?.PARENT_HOST_REF === pest?.HOST_REF)
          ) {
            //* ******************If matches update the Regulation information  */
            rlPestLink.REGULATION = pest?.REGULATION
            rlPestLink.QUARANTINE_INDICATOR = pest?.QUARANTINE_INDICATOR
            rlPestLink.REGULATION_INDICATOR = pest?.REGULATION_INDICATOR
            rlPestLink.REGULATION_CATEGORY = pest?.REGULATION_CATEGORY

            //* ******************if quarantine indicator is R and plant data -> parent_host_ref matches with pest regulation host ref then update the regulation information  */
          } else if (
            pest?.QUARANTINE_INDICATOR === 'R' &&
            rl?.PARENT_HOST_REF === pest?.HOST_REF &&
            rlPestLink.QUARANTINE_INDICATOR === ''
          ) {
            rlPestLink.REGULATION = pest?.REGULATION
            rlPestLink.QUARANTINE_INDICATOR = pest?.QUARANTINE_INDICATOR
            rlPestLink.REGULATION_INDICATOR = pest?.REGULATION_INDICATOR
            rlPestLink.REGULATION_CATEGORY = pest?.REGULATION_CATEGORY
          } else {
            /** ** Match GrandParent ****/
            pestRegResultListGrandParent.forEach((gp) => {
              if (
                gp.HOST_REF === pest?.HOST_REF &&
                rlPestLink.QUARANTINE_INDICATOR === ''
              ) {
                rlPestLink.REGULATION = gp?.pestRegList?.REGULATION
                rlPestLink.QUARANTINE_INDICATOR =
                  gp?.pestRegList?.QUARANTINE_INDICATOR
                rlPestLink.REGULATION_INDICATOR =
                  gp?.pestRegList?.REGULATION_INDICATOR
                rlPestLink.REGULATION_CATEGORY =
                  gp?.pestRegList?.REGULATION_CATEGORY
              }
            })
          }
        }
      })
    })
  })
}
// Build a Pest regulation list by finding the grandparent host_ref
function pestRegParentListresultList(
  plantDocuments,
  plantDocsFromDB,
  plantPestRegList
) {
  logger.info('pestRegParentListresultList started...')
  const resultListParent = plantDocuments
    // eslint-disable-next-line array-callback-return
    .map((rl) => {
      const matchingElement = plantDocsFromDB.find(
        (pl) => +pl.HOST_REF === +rl.PARENT_HOST_REF
      )
      if (matchingElement) {
        return {
          ...matchingElement,
          HOST_CHILD_REF: rl.HOST_REF
        }
      }
    })
    .filter((element) => element !== undefined)
  return resultListParent.map((rl) => {
    const pestRegListParent = plantPestRegList
      .filter((pest) => +rl.PARENT_HOST_REF === +pest.HOST_REF)
      .filter((pest) => pest.HOST_REF !== null)
    return {
      HOST_REF: rl.HOST_CHILD_REF,
      pestRegList: pestRegListParent
    }
  })
}
function updateResultListWithPestCountry(plantDocuments, pestDistributionList) {
  logger.info('updateResultListWithPestCountry started...')
  const cslRefMap = {}

  plantDocuments.forEach((item) => {
    item.PEST_LINK.forEach((pestLink) => {
      pestDistributionList.forEach((distribution) => {
        if (pestLink.CSL_REF === distribution.CSL_REF) {
          if (!cslRefMap[pestLink.CSL_REF]) {
            cslRefMap[pestLink.CSL_REF] = []
          }
          cslRefMap[pestLink.CSL_REF].push({
            COUNTRY_NAME: distribution.COUNTRY_NAME,
            COUNTRY_CODE: distribution.COUNTRY_CODE,
            STATUS: distribution.STATUS
          })
        }
      })
    })
  })

  Object.keys(cslRefMap).forEach((cslRef) => {
    const seen = new Set()
    cslRefMap[cslRef] = cslRefMap[cslRef].filter((country) => {
      if (seen.has(country.COUNTRY_CODE)) {
        return false
      } else {
        seen.add(country.COUNTRY_CODE)
        return true
      }
    })
  })

  const countryResultList = Object.keys(cslRefMap).map((cslRef) => ({
    CSL_REF: parseInt(cslRef, 10),
    COUNTRIES: cslRefMap[cslRef]
  }))

  plantDocuments.forEach((pl) => {
    countryResultList.forEach((pest) => {
      pl.PEST_LINK.forEach((x) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.PEST_COUNTRY = pest?.COUNTRIES
        }
      })
    })
  })
}

async function insertResultList(db, plantDocuments) {
  logger.info('insertResultList started...')
  const collectionNew = db.collection('PLANT_DATA')
  const result = await collectionNew.insertMany(plantDocuments)
  logger?.info(`${result.insertedCount} plant documents were inserted...`)
  await runIndexManagement(db, logger)
}

export {
  loadData,
  updateDbPlantHandler,
  loadCollections,
  buildResultList,
  mapAnnex6,
  mapAnnex11,
  mapAnnex11ParentHost,
  mapAnnex11GrandParent,
  mapPestLink,
  clearCollectionIfExists,
  updateResultListWithAnnex11,
  updateResultListWithAnnex11ParentHost,
  updateResultListWithAnnex11GrandParent,
  updateResultListWithAnnex11GreatGrandParent,
  updateResultListWithAnnex6,
  updateResultListWithPestLink,
  updateResultListWithPestNames,
  updateResultListWithPestReg,
  updateResultListWithPestCountry,
  insertResultList,
  createMongoDBIndexes
}
