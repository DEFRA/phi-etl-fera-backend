import { workflowEngine } from './workflowEngine'

let logger = ''
let plantInfo = ''
let plantDocument = ''
let prohibitedObj = ''
let counter = 0
let plantGrandParentHostRef = ''
let plantGreatGrandParentHostRef = ''

class ProhibitedStrategy extends workflowEngine {
  constructor(
    plantDocument,
    plantNameDoc,
    searchInput,
    countryMapping,
    cdpLogger
  ) {
    super(plantDocument, plantNameDoc, searchInput, countryMapping, cdpLogger)
    this.decision = ''
    logger = this.loggerObj
    prohibitedObj = this // has reference of an object of this class

    // introduced to handle subfamily conditions, PHIDP-462
    plantGrandParentHostRef = this.plantNameDoc.GRAND_PARENT_HOST_REF
    plantGreatGrandParentHostRef = this.plantNameDoc.GREAT_GRAND_PARENT_HOST_REF
  }

  async execute() {
    logger.info('Check if Annex6 (PROHIBITED) rule applies?')

    // holds the plant details returned from MongoDB for matching host_ref from PLANT_DATA
    // it has annex6 and annex11 array
    plantDocument = this.data

    // this will be the Return object, passed as response to the frontend service
    plantInfo = {
      hostRef: this.hostRef.toString(), // host_ref corresponding to the plant selected by user on frontend
      country: this.country, // country selected by the user on frontend
      eppoCode: plantDocument.EPPO_CODE,
      plantName: plantDocument.PLANT_NAME,
      annexSixRule: '',
      annexElevenRule: '',
      outcome: '',
      pestDetails: [],
      annex11RulesArr: [],
      isEUSL: false,
      all: false,
      subformat: 'x',
      ProhibitionClarification: '',
      FormatClarification: '',
      hybridIndicator: '',
      dormantIndicator: '',
      seedIndicator: '',
      fruitIndicator: '',
      bonsaiIndicator: '',
      invintroIndicator: ''
    }

    /*
      NOTE: 
      THE CODE HAS EVOLVED OVER A PERIOD OF TIME, FOR MAINTAINABILITY WE CAN CONSIDER
      CODE MODULARISATION. IT'LL NEED SOME PLANNING THOUGH, AS ORDER OF INVOCATION OF THE
      FUNCTIONS MATTER.
    */

    // PLEASE NOTE: THE ORDER OF THE INVOCATION MATTERS
    // UN-PROHIBITED CHECKS--------------------------------------------------------------

    // Prohibited/Paritially-Prohibited checks at Country level for Species--------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtHostRefCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtHostRefCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtHostRefCountryLevel()
    }

    // Prohibited/Paritially-Prohibited checks at Region level for Species---------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtHostRefRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtHostRefRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtHostRefRegionLevel()
    }

    // Prohibited/Paritially-Prohibited checks at All level for species------------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckHostRefAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtHostRefAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtHostRefAllLevel()
    }

    // Prohibited/Paritially-Prohibited checks at Country level for Genus----------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtGenusCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtGenusCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtGenusCountryLevel()
    }

    // Prohibited/Paritially-Prohibited checks at Region level for Genus-----------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtGenusRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtGenusRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtGenusRegionLevel()
    }

    // Prohibited/Paritially-Prohibited checks at All level for Genus--------------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckGenusAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckkAtGenusAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtGenusAllLevel()
    }

    // PHIDP-462
    // Prohibited/Paritially-Prohibited checks at Country level for Sub-Family----------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtSubFamilyCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtSubFamilyCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtSubFamilyCountryLevel()
    }

    // Prohibited/Paritially-Prohibited checks at Region level for Sub-Family-----------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtSubFamilyRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtSubFamilyRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtSubFamilyRegionLevel()
    }

    // Prohibited/Paritially-Prohibited checks at All level for Sub-Family--------------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckSubFamilyAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtSubFamilyAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtSubFamilyAllLevel()
    }

    // PHIDP-462

    // Prohibited/Paritially-Prohibited checks at Country level for Family----------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtFamilyCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtFamilyCountryLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtFamilyCountryLevel()
    }

    // Prohibited/Paritially-Prohibited checks at Region level for Family-----------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckAtFamilyRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtFamilyRegionLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtFamilyRegionLevel()
    }

    // Prohibited/Paritially-Prohibited checks at All level for Family--------------------
    if (plantInfo.outcome === '') {
      plantInfo = await prohibitionCheckFamilyAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await unprohibitedCheckAtFamilyAllLevel()
    }
    if (plantInfo.outcome === '') {
      plantInfo = await partiallyProhibitedCheckAtFamilyAllLevel()
    }

    if (plantInfo.outcome === '') {
      plantInfo = await noAnnex6ItsUnprohibited()
    }

    // FINALLY, GET PESTS----------------------------------------------------------------
    plantInfo = await getPests()

    counter += 1
    logger.info('execute: ' + counter)

    logger.info('Annex6 (PROHIBITED) checks performed')
    return plantInfo

    // #region PROHIBITION CHECKS---------------------------------------------------------

    // HOST_REF, COUNTRY
    async function prohibitionCheckAtHostRefCountryLevel() {
      logger.info('Starting Prohibited check at HOST_REF, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === prohibitedObj.hostRef.toString()
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule is APPLICABLE at HOST_REF, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'p')
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtHostRefCountryLevel: ' + counter)
      return plantInfo
    }
    // GENUS, COUNTRY
    async function prohibitionCheckAtGenusCountryLevel() {
      logger.info('Starting Prohibited check at GENUS, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF)
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule is APPLICABLE at GENUS, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'p')
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtGenusCountryLevel: ' + counter)
      return plantInfo
    }
    // SUB-FAMILY, COUNTRY (PHIDP-462)
    async function prohibitionCheckAtSubFamilyCountryLevel() {
      logger.info('Starting Prohibited check at SUB-FAMILY, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF)
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule is APPLICABLE at SUB-FAMILY, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                    ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'p')
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtSubFamilyCountryLevel: ' + counter)
      return plantInfo
    }

    // FAMILY, COUNTRY
    async function prohibitionCheckAtFamilyCountryLevel() {
      logger.info('Starting Prohibited check at FAMILY, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF)
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule is APPLICABLE at FAMILY, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                    ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'p')
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtFamilyCountryLevel: ' + counter)
      return plantInfo
    }

    // HOST_REF, REGION
    async function prohibitionCheckAtHostRefRegionLevel() {
      logger.info('Starting Prohibition check at HOST_REF, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === prohibitedObj.hostRef.toString()
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                const regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = regionValue.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = regionValue.split(',')[1]

                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Annex6 (PROHIBITED) rule is APPLICABLE at HOST_REF, REGION level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                    ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'p')
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtHostRefRegionLevel: ' + counter)
      return plantInfo
    }
    // GENUS, REGION
    async function prohibitionCheckAtGenusRegionLevel() {
      logger.info('Starting Prohibition check at GENUS, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF)
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                const regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = regionValue.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = regionValue.split(',')[1]

                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Annex6 (PROHIBITED) rule is APPLICABLE at GENUS, REGION level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                    ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'p')
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtGenusRegionLevel: ' + counter)
      return plantInfo
    }

    // SUB-FAMILY, REGION
    async function prohibitionCheckAtSubFamilyRegionLevel() {
      logger.info('Starting Prohibition check at SUB-FAMILY, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF)
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                const regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = regionValue.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = regionValue.split(',')[1]

                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Annex6 (PROHIBITED) rule is APPLICABLE at SUB-FAMILY, REGION level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                        ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'p')
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtSubFamilyRegionLevel: ' + counter)
      return plantInfo
    }

    // FAMILY, REGION
    async function prohibitionCheckAtFamilyRegionLevel() {
      logger.info('Starting Prohibition check at FAMILY, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF)
            ) {
              if (
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                annex.HYBRID_INDICATOR === '' &&
                annex.DORMANT_INDICATOR === '' &&
                annex.SEED_INDICATOR === '' &&
                annex.FRUIT_INDICATOR === '' &&
                annex.BONSAI_INDICATOR === '' &&
                annex.INVINTRO_INDICATOR === '' &&
                annex.PROHIBITION_CLARIFICATION === '' &&
                annex.FORMAT_CLARIFICATION === '' &&
                annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
              ) {
                const regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = regionValue.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = regionValue.split(',')[1]

                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Annex6 (PROHIBITED) rule is APPLICABLE at FAMILY, REGION level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                        ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'p')
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      logger.info('prohibitionCheckAtFamilysRegionLevel: ' + counter)
      return plantInfo
    }

    // HOST_REF, ALL
    async function prohibitionCheckHostRefAllLevel() {
      logger.info('Starting Prohibition check at HOST_REF, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() === prohibitedObj.hostRef.toString()
          ) {
            if (
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '' &&
              annex.PROHIBITION_CLARIFICATION === '' &&
              annex.FORMAT_CLARIFICATION === '' &&
              annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
            ) {
              logger.info(
                `Annex6 (PROHIBITED) rule is APPLICABLE at HOST_REF, ALL level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
              )

              await setPlantAttributes(annex, 'p')
            }
          }
        })
      }

      logger.info('prohibitionCheckHostRefAllLevel: ' + counter)
      return plantInfo
    }
    // GENUS, ALL
    async function prohibitionCheckGenusAllLevel() {
      logger.info('Starting Prohibition check at GENUS, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() !==
              prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF)
          ) {
            if (
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '' &&
              annex.PROHIBITION_CLARIFICATION === '' &&
              annex.FORMAT_CLARIFICATION === '' &&
              annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
            ) {
              logger.info(
                `Annex6 (PROHIBITED) rule is APPLICABLE at GENUS, ALL level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
              )

              await setPlantAttributes(annex, 'p')
            }
          }
        })
      }

      logger.info('prohibitionCheckGenusAllLevel: ' + counter)
      return plantInfo
    }

    // SUB-FAMILY, ALL
    async function prohibitionCheckSubFamilyAllLevel() {
      logger.info('Starting Prohibition check at SUB-FAMILY, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() !==
              prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() ===
              String(annex.GRAND_PARENT_HOST_REF)
          ) {
            if (
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '' &&
              annex.PROHIBITION_CLARIFICATION === '' &&
              annex.FORMAT_CLARIFICATION === '' &&
              annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
            ) {
              logger.info(
                `Annex6 (PROHIBITED) rule is APPLICABLE at SUB-FAMILY, ALL level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
              )

              await setPlantAttributes(annex, 'p')
            }
          }
        })
      }

      logger.info('prohibitionCheckSubFamilyAllLevel: ' + counter)
      return plantInfo
    }

    // FAMILY, ALL
    async function prohibitionCheckFamilyAllLevel() {
      logger.info('Starting Prohibition check at FAMILY, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() !==
              prohibitedObj.hostRef.toString() &&
            annex.PHI_HOST_REF.toString() ===
              String(annex.GREAT_GRAND_PARENT_HOST_REF)
          ) {
            if (
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '' &&
              annex.PROHIBITION_CLARIFICATION === '' &&
              annex.FORMAT_CLARIFICATION === '' &&
              annex.OVERALL_DECISION.toLowerCase() !== 'not prohibited'
            ) {
              logger.info(
                `Annex6 (PROHIBITED) rule is APPLICABLE at FAMILY, ALL level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
              )

              await setPlantAttributes(annex, 'p')
            }
          }
        })
      }

      logger.info('prohibitionCheckFamilyAllLevel: ' + counter)
      return plantInfo
    }

    // #endregion

    // #region PARTIAL PROHIBITION CHECKS-------------------------------------------------

    async function partiallyProhibitedCheckAtHostRefCountryLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at GENUS, Country level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === prohibitedObj.hostRef.toString()
            ) {
              if (
                // check if atlease 1 exemption exists
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at GENUS, COUNTRY level, SERVICE_FORMAT matched', 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      logger.info('partiallyProhibitionCheckAtGenusCountryLevel: ' + counter)
      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('PARTIALLY PROHIBITED check APPLICABLE at Country level')
      }
      return plantInfo
    }

    async function partiallyProhibitedCheckAtHostRefRegionLevel() {
      let annexMatched = false
      logger.info(
        'Starting PARTIALLY PROHIBITED check at HOST_REF, REGION level'
      )
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === prohibitedObj.hostRef.toString()
            ) {
              if (
                // get Annex6 entries which has regions, match it with the region of the input country
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.COUNTRY_NAME.toLowerCase() !== 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = annex6Region.split(',')[1]
                // get the region from countries collection
                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  // check if region level entry exists for Annex 6
                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Partially Prohibited check applicable at HOST_REF, REGION level, SERVICE_FORMAT matched, 
                      ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                      ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'pp')
                    annexMatched = true
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at HOST_REF, REGION level'
        )
      }

      logger.info('partiallyProhibitionCheckAtHostRefRegionLevel: ' + counter)
      return plantInfo
    }

    async function partiallyProhibitedCheckAtHostRefAllLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at HOST_REF, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === prohibitedObj.hostRef.toString()
            ) {
              if (
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() === 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at HOST_REF, ALL level, SERVICE_FORMAT matched, 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )
                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at HOST_REF, ALL level'
        )
      }

      logger.info('partiallyProhibitionCheckAtHostRefAllLevel: ' + counter)
      return plantInfo
    }

    async function partiallyProhibitedCheckAtGenusCountryLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at GENUS, Country level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF)
            ) {
              if (
                // check if atlease 1 exemption exists
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at GENUS, COUNTRY level, SERVICE_FORMAT matched', 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      logger.info('partiallyProhibitionCheckAtGenusCountryLevel: ' + counter)
      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('PARTIALLY PROHIBITED check APPLICABLE at Country level')
      }

      return plantInfo
    }

    async function partiallyProhibitedCheckAtGenusRegionLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at GENUS, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF)
            ) {
              if (
                // get Annex6 entries which has regions, match it with the region of the input country
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.COUNTRY_NAME.toLowerCase() !== 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = annex6Region.split(',')[1]
                // get the region from countries collection
                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  // check if region level entry exists for Annex 6
                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Partially Prohibited check applicable at GENUS, REGION level, SERVICE_FORMAT matched, 
                      ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                      ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'pp')
                    annexMatched = true
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at GENUS, REGION level'
        )
      }

      logger.info('partiallyProhibitionCheckAtGenusRegionLevel: ' + counter)
      return plantInfo
    }

    async function partiallyProhibitedCheckAtGenusAllLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at GENUS, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF)
            ) {
              if (
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() === 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Level 3D: Partially Prohibited check applicable at GENUS, ALL level, SERVICE_FORMAT matched, 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )
                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('PARTIALLY PROHIBITED check APPLICABLE at GENUS, ALL level')
      }

      logger.info('partiallyProhibitionCheckAtAllLevel: ' + counter)
      return plantInfo
    }

    // PHIDP-462
    async function partiallyProhibitedCheckAtSubFamilyCountryLevel() {
      let annexMatched = false
      logger.info(
        'Starting PARTIALLY PROHIBITED check at SUB-FAMILY, Country level'
      )
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF)
            ) {
              if (
                // check if atlease 1 exemption exists
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at SUB-FAMILY, COUNTRY level, SERVICE_FORMAT matched', 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      logger.info('partiallyProhibitedCheckAtSubFamilyCountryLevel: ' + counter)
      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('PARTIALLY PROHIBITED check APPLICABLE at SUB-Family level')
      }
      return plantInfo
    }

    async function partiallyProhibitedCheckAtSubFamilyRegionLevel() {
      let annexMatched = false
      logger.info(
        'Starting PARTIALLY PROHIBITED check at SUB-FAMILY, REGION level'
      )
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF)
            ) {
              if (
                // get Annex6 entries which has regions, match it with the region of the input country
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.COUNTRY_NAME.toLowerCase() !== 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = annex6Region.split(',')[1]
                // get the region from countries collection
                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  // check if region level entry exists for Annex 6
                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Partially Prohibited check applicable at SUB-FAMILY, REGION level, SERVICE_FORMAT matched, 
                      ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                      ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'pp')
                    annexMatched = true
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at SUB-FAMILY, REGION level'
        )
      }

      logger.info('partiallyProhibitedCheckAtSubFamilyRegionLevel: ' + counter)
      return plantInfo
    }

    async function partiallyProhibitedCheckAtSubFamilyAllLevel() {
      let annexMatched = false
      logger.info(
        'Starting PARTIALLY PROHIBITED check at SUB-FAMILY, ALL level'
      )
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF)
            ) {
              if (
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() === 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at SUB-FAMILY, ALL level, SERVICE_FORMAT matched, 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )
                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at SUB-FAMILY, ALL level'
        )
      }

      logger.info('partiallyProhibitedCheckAtSubFamilyAllLevel: ' + counter)
      return plantInfo
    }
    // PHIDP-462

    async function partiallyProhibitedCheckAtFamilyCountryLevel() {
      let annexMatched = false
      logger.info(
        'Starting PARTIALLY PROHIBITED check at FAMILY, Country level'
      )
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF)
            ) {
              if (
                // check if atlease 1 exemption exists
                annex.COUNTRY_NAME.toLowerCase() ===
                  prohibitedObj.country.toLowerCase() &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at FAMILY, COUNTRY level, SERVICE_FORMAT matched', 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )

                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      logger.info('partiallyProhibitedCheckAtFamilyCountryLevel: ' + counter)
      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('PARTIALLY PROHIBITED check APPLICABLE at Family level')
      }
      return plantInfo
    }

    async function partiallyProhibitedCheckAtFamilyRegionLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at FAMILY, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF)
            ) {
              if (
                // get Annex6 entries which has regions, match it with the region of the input country
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() !==
                  prohibitedObj.country.toLowerCase() &&
                annex.COUNTRY_NAME.toLowerCase() !== 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                const annex6RegionValue = annex6Region.split(',')[1]
                // get the region from countries collection
                const regionArr = await getCountryIndicators()
                regionArr.forEach(async function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  // check if region level entry exists for Annex 6
                  if (
                    reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                    reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                  ) {
                    logger.info(
                      `Partially Prohibited check applicable at FAMILY, REGION level, SERVICE_FORMAT matched, 
                      ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                      ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                    )

                    await setPlantAttributes(annex, 'pp')
                    annexMatched = true
                  }
                })
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at FAMILY, REGION level'
        )
      }

      logger.info('partiallyProhibitedCheckAtFamilyRegionLevel: ' + counter)
      return plantInfo
    }

    async function partiallyProhibitedCheckAtFamilyAllLevel() {
      let annexMatched = false
      logger.info('Starting PARTIALLY PROHIBITED check at FAMILY, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF)
            ) {
              if (
                plantInfo.outcome === '' &&
                annex.COUNTRY_NAME.toLowerCase() === 'all' &&
                annex.SERVICE_FORMAT.toLowerCase() ===
                  prohibitedObj.serviceFormat.toLowerCase() &&
                (annex.HYBRID_INDICATOR !== '' ||
                  annex.DORMANT_INDICATOR !== '' ||
                  annex.SEED_INDICATOR !== '' ||
                  annex.FRUIT_INDICATOR !== '' ||
                  annex.BONSAI_INDICATOR !== '' ||
                  annex.INVINTRO_INDICATOR !== '' ||
                  annex.PROHIBITION_CLARIFICATION !== '' ||
                  annex.FORMAT_CLARIFICATION !== '')
              ) {
                logger.info(
                  `Partially Prohibited check applicable at FAMILY, ALL level, SERVICE_FORMAT matched, 
                ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`
                )
                await setPlantAttributes(annex, 'pp')
                annexMatched = true
              }
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'PARTIALLY PROHIBITED check APPLICABLE at FAMILY, ALL level'
        )
      }

      logger.info('partiallyProhibitedCheckAtFamilyAllLevel: ' + counter)
      return plantInfo
    }

    // #endregion

    async function setPlantAttributes(annex, indicator) {
      plantInfo.annexSixRule = annex.A6_RULE

      logger.info(indicator)
      if (indicator === 'pp')
        plantInfo.outcome = 'partially-prohibited' // annex.OVERALL_DECISION
      else if (indicator === 'p')
        plantInfo.outcome = 'prohibited' // annex.OVERALL_DECISION
      else if (indicator === 'up') plantInfo.outcome = 'un-prohibited' // annex.OVERALL_DECISION

      logger.info('OUTCOME SET: ')
      logger.info(plantInfo.outcome)

      plantInfo.ProhibitionClarification = annex.PROHIBITION_CLARIFICATION
      plantInfo.FormatClarification = annex.FORMAT_CLARIFICATION

      plantInfo.hybridIndicator = annex.HYBRID_INDICATOR
      plantInfo.dormantIndicator = annex.DORMANT_INDICATOR
      plantInfo.seedIndicator = annex.SEED_INDICATOR
      plantInfo.fruitIndicator = annex.FRUIT_INDICATOR
      plantInfo.bonsaiIndicator = annex.BONSAI_INDICATOR
      plantInfo.invintroIndicator = annex.INVINTRO_INDICATOR
      if (
        plantInfo.hybridIndicator !== '' &&
        plantInfo.dormantIndicator === '' &&
        plantInfo.seedIndicator === '' &&
        plantInfo.fruitIndicator === '' &&
        plantInfo.bonsaiIndicator === '' &&
        plantInfo.invintroIndicator === '' &&
        plantInfo.FormatClarification === '' &&
        plantInfo.ProhibitionClarification === ''
      ) {
        plantInfo.outcome = 'prohibited'
      }
    }

    // #region ANNEX11 CHECKS-------------------------------------------------------------
    async function getAnnex11ForHRCountrySvcFmtSpecies(annex11) {
      let annex11PlantRule = ''
      // Get annex11 rules for Hostref/Country/Service format/Species

      if (prohibitedObj.hostRef.toString() === annex11.HOST_REF.toString()) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() ===
            annex11.COUNTRY_NAME.toLowerCase()
          ) {
            logger.info(
              `Annex 11 rules found for Hostref/Country/Service format/Species , ${annex11.HOST_REF.toString()},
               ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForHRRegionSvcFmtSpecies(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules for Hostref/Region/Service format/Species

      if (prohibitedObj.hostRef.toString() === annex11.HOST_REF.toString()) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() !==
              annex11.COUNTRY_NAME.toLowerCase() &&
            annex11.COUNTRY_NAME.toLowerCase() !== 'all'
          ) {
            // Get annex11 rules at Genus level for the matching service format
            const annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            const annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            const annex11RegionValue = annex11Region.split(',')[1]
            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              if (
                reg[0]?.toLowerCase() === annex11RegionType?.toLowerCase() &&
                reg[1]?.toLowerCase() === annex11RegionValue?.toLowerCase()
              ) {
                logger.info(
                  `Annex 11 rules found for Hostref/Region/Service format/Species , ${annex11.HOST_REF.toString()},
                   ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
                )
                annex11PlantRule = annex11
              }
            })
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForHRAllSvcFmt(annex11) {
      let annex11PlantRule = ''

      if (prohibitedObj.hostRef.toString() === annex11.HOST_REF.toString()) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {
            logger.info(
              `Annex 11 rules found for Hostref/All/Service format , ${annex11.HOST_REF.toString()}, ${annex11.COUNTRY_NAME}, 
              ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForCountrySvcFmtGenus(annex11) {
      let annex11PlantRule = ''
      // Get annex11 rules at Country/Service format/Genus

      if (
        prohibitedObj.hostRef.toString() !== annex11.HOST_REF.toString() &&
        annex11.HOST_REF.toString() !== '99999' &&
        String(plantDocument.PARENT_HOST_REF) === annex11.HOST_REF.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() ===
            annex11.COUNTRY_NAME.toLowerCase()
          ) {
            logger.info(
              `Annex 11 rules found for Country/Service format/Genus , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForRegionSvcFmtGenus(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at Region/Service format/Genus

      if (
        prohibitedObj.hostRef.toString() !== annex11.HOST_REF.toString() &&
        annex11.HOST_REF.toString() !== '99999' &&
        String(plantDocument.PARENT_HOST_REF) === annex11.HOST_REF.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() !==
              annex11.COUNTRY_NAME.toLowerCase() &&
            prohibitedObj.country.toLowerCase() !== 'all'
          ) {
            const annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            const annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            const annex11RegionValue = annex11Region.split(',')[1]
            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              if (
                reg[0]?.toLowerCase() === annex11RegionType.toLowerCase() &&
                reg[1]?.toLowerCase() === annex11RegionValue.toLowerCase()
              ) {
                logger.info(
                  `Annex 11 rules found for Region/Service format/Genus , ${annex11.HOST_REF.toString()}, 
                  ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
                )
                annex11PlantRule = annex11
              }
            })
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForAllSvcFmtGenus(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format/Genus
      if (
        prohibitedObj.hostRef.toString() !== annex11.HOST_REF.toString() &&
        annex11.HOST_REF.toString() !== '99999' &&
        String(plantDocument.PARENT_HOST_REF) === annex11.HOST_REF.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {
            logger.info(
              `Annex 11 rules found for All/Service format/Genus , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForCountrySvcFmtSubFamily(annex11) {
      let annex11PlantRule = ''
      // Get annex11 rules at Country/Service format/Sub-Family

      if (
        plantGrandParentHostRef !== null &&
        annex11.HOST_REF.toString() === plantGrandParentHostRef.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() ===
            annex11.COUNTRY_NAME.toLowerCase()
          ) {
            logger.info(
              `Annex 11 rules found for Country/Service format/Sub-Family , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForRegionSvcFmtSubFamily(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at Region/Service format/Sub-Family

      if (
        plantGrandParentHostRef !== null &&
        annex11.HOST_REF.toString() === plantGrandParentHostRef.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() !==
              annex11.COUNTRY_NAME.toLowerCase() &&
            prohibitedObj.country.toLowerCase() !== 'all'
          ) {
            const annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            const annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            const annex11RegionValue = annex11Region.split(',')[1]
            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              if (
                reg[0]?.toLowerCase() === annex11RegionType.toLowerCase() &&
                reg[1]?.toLowerCase() === annex11RegionValue.toLowerCase()
              ) {
                logger.info(
                  `Annex 11 rules found for Region/Service format/Sub-Family , ${annex11.HOST_REF.toString()}, 
                  ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
                )
                annex11PlantRule = annex11
              }
            })
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForAllSvcFmtSubFamily(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format/Sub-Family
      if (
        plantGrandParentHostRef !== null &&
        annex11.HOST_REF.toString() === plantGrandParentHostRef.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {
            logger.info(
              `Annex 11 rules found for All/Service format/Sub-Family , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForCountrySvcFmtFamily(annex11) {
      let annex11PlantRule = ''
      // Get annex11 rules at Country/Service format/Family

      if (
        plantGreatGrandParentHostRef !== null &&
        annex11.HOST_REF.toString() === plantGreatGrandParentHostRef.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() ===
            annex11.COUNTRY_NAME.toLowerCase()
          ) {
            logger.info(
              `Annex 11 rules found for Country/Service format/Family , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForRegionSvcFmtFamily(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at Region/Service format/Family

      if (
        plantGreatGrandParentHostRef !== null &&
        annex11.HOST_REF.toString() === plantGreatGrandParentHostRef.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() !==
              annex11.COUNTRY_NAME.toLowerCase() &&
            prohibitedObj.country.toLowerCase() === 'all'
          ) {
            const annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            const annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            const annex11RegionValue = annex11Region.split(',')[1]
            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              if (
                reg[0]?.toLowerCase() === annex11RegionType.toLowerCase() &&
                reg[1]?.toLowerCase() === annex11RegionValue.toLowerCase()
              ) {
                logger.info(
                  `Annex 11 rules found for Region/Service format/Family , ${annex11.HOST_REF.toString()}, 
                  ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
                )
                annex11PlantRule = annex11
              }
            })
          }
        }
      }
      return annex11PlantRule
    }

    async function getAnnex11ForAllSvcFmtFamily(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format/Family
      if (
        plantGreatGrandParentHostRef !== null &&
        annex11.HOST_REF.toString() === plantGreatGrandParentHostRef.toString()
      ) {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {
            logger.info(
              `Annex 11 rules found for All/Service format/Family , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    // If a match not found at Species, Genus, Sub-Family & Family level, Apply Default rule.
    // Host_ref: 99999 indicates default rule
    async function getAnnex11ForAllSvcFmtCountry(annex11) {
      let annex11PlantRule = ''
      // Get annex11 rules at All/Service format/Country

      if (annex11.HOST_REF.toString() === '99999') {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() ===
            annex11.COUNTRY_NAME.toLowerCase()
          ) {
            logger.info(
              `Annex 11 rules found for All/Service format/Country , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    // If a match not found at Species, Genus, Sub-Family &  Family level, Apply Default rule.
    // Host_ref: 99999 indicates default rule
    async function getAnnex11ForAllSvcFmtRegion(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format/Region

      if (annex11.HOST_REF.toString() === '99999') {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (
            prohibitedObj.country.toLowerCase() !==
              annex11.COUNTRY_NAME.toLowerCase() &&
            prohibitedObj.country.toLowerCase() !== 'all'
          ) {
            const annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            const annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            const annex11RegionValue = annex11Region.split(',')[1]
            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              if (
                reg[0]?.toLowerCase() === annex11RegionType?.toLowerCase() &&
                reg[1]?.toLowerCase() === annex11RegionValue?.toLowerCase()
              ) {
                logger.info(
                  `Annex 11 rules found for All/Service format/Region , ${annex11.HOST_REF.toString()}, 
                  ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
                )
                annex11PlantRule = annex11
              }
            })
          }
        }
      }

      return annex11PlantRule
    }

    // If a match not found at Species, Genus, Sub-Family &  Family level, Apply Default rule.
    // Host_ref: 99999 indicates default rule
    async function getAnnex11ForAllSvcFmt(annex11) {
      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format

      if (annex11.HOST_REF.toString() === '99999') {
        if (
          annex11.SERVICE_FORMAT.toLowerCase() ===
          prohibitedObj.serviceFormat.toLowerCase()
        ) {
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {
            logger.info(
              `Annex 11 rules found for All/Service format  , ${annex11.HOST_REF.toString()}, 
              ${annex11.COUNTRY_NAME}, ${prohibitedObj.country}`
            )
            annex11PlantRule = annex11
          }
        }
      }
      return annex11PlantRule
    }

    // Separate entries with 'other formats' and those without
    function sortAnnex11(a, b) {
      if (
        a.SERVICE_SUBFORMAT === 'other formats' &&
        b.SERVICE_SUBFORMAT !== 'other formats'
      ) {
        return 1 // Move 'other formats' to the bottom
      } else {
        if (a.BTOM_EUSL > b.BTOM_EUSL) {
          return 1
        }
        if (a.BTOM_EUSL < b.BTOM_EUSL) {
          return -1
        }
        if (a.BTOM_NON_EUSL > b.BTOM_NON_EUSL) {
          return 1
        }
        if (a.BTOM_NON_EUSL < b.BTOM_NON_EUSL) {
          return -1
        }
      }
      if (
        a.SERVICE_SUBFORMAT !== 'other formats' &&
        b.SERVICE_SUBFORMAT === 'other formats'
      ) {
        return -1 // Keep non-'other formats' at the top
      } else {
        if (a.BTOM_EUSL > b.BTOM_EUSL) {
          return 1
        }
        if (a.BTOM_EUSL < b.BTOM_EUSL) {
          return -1
        }
        if (a.BTOM_NON_EUSL > b.BTOM_NON_EUSL) {
          return 1
        }
        if (a.BTOM_NON_EUSL < b.BTOM_NON_EUSL) {
          return -1
        }
      }
      return 0
    }

    async function getAnnex11Rules() {
      counter += 1
      let annex11CountrySpecies = ''
      let annex11RegionSpecies = ''
      let annex11AllSpecies = ''
      const annex11CountrySpeciesArr = []
      const annex11RegionSpeciesArr = []
      const annex11AllSpeciesArr = []

      let annex11CountryGenus = ''
      let annex11RegionGenus = ''
      let annex11AllGenus = ''
      const annex11CountryGenusArr = []
      const annex11RegionGenusArr = []
      const annex11AllGenusArr = []

      let annex11CountrySubFamily = ''
      let annex11RegionSubFamily = ''
      let annex11AllSubFamily = ''
      const annex11CountrySubFamilyArr = []
      const annex11RegionSubFamilyArr = []
      const annex11AllSubFamilyArr = []

      let annex11CountryFamily = ''
      let annex11RegionFamily = ''
      let annex11AllFamily = ''
      const annex11CountryFamilyArr = []
      const annex11RegionFamilyArr = []
      const annex11AllFamilyArr = []

      let annex11CountryDefault = ''
      let annex11RegionDefault = ''
      let annex11AllDefault = ''
      const annex11CountryDefaultArr = []
      const annex11RegionDefaultArr = []
      const annex11AllDefaultArr = []

      let a11RulesFetched = false

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)) {
        const promises = plantDocument.HOST_REGULATION.ANNEX11.map(
          async (annex11) => {
            // SPECIES
            annex11CountrySpecies =
              await getAnnex11ForHRCountrySvcFmtSpecies(annex11)
            if (
              typeof annex11CountrySpecies === 'object' &&
              annex11CountrySpecies !== null
            ) {
              annex11CountrySpeciesArr.push(annex11CountrySpecies)
            }

            annex11RegionSpecies =
              await getAnnex11ForHRRegionSvcFmtSpecies(annex11)
            if (
              typeof annex11RegionSpecies === 'object' &&
              annex11RegionSpecies !== null
            ) {
              annex11RegionSpeciesArr.push(annex11RegionSpecies)
            }

            annex11AllSpecies = await getAnnex11ForHRAllSvcFmt(annex11)
            if (
              typeof annex11AllSpecies === 'object' &&
              annex11AllSpecies !== null
            ) {
              annex11AllSpeciesArr.push(annex11AllSpecies)
            }

            // GENUS
            annex11CountryGenus = await getAnnex11ForCountrySvcFmtGenus(annex11)
            if (
              typeof annex11CountryGenus === 'object' &&
              annex11CountryGenus !== null
            ) {
              annex11CountryGenusArr.push(annex11CountryGenus)
            }

            annex11RegionGenus = await getAnnex11ForRegionSvcFmtGenus(annex11)
            if (
              typeof annex11RegionGenus === 'object' &&
              annex11RegionGenus !== null
            ) {
              annex11RegionGenusArr.push(annex11RegionGenus)
            }

            annex11AllGenus = await getAnnex11ForAllSvcFmtGenus(annex11)
            if (
              typeof annex11AllGenus === 'object' &&
              annex11AllGenus !== null
            ) {
              annex11AllGenusArr.push(annex11AllGenus)
            }

            // PHIDP-462

            // SUB-FAMILY
            annex11CountrySubFamily =
              await getAnnex11ForCountrySvcFmtSubFamily(annex11)
            if (
              typeof annex11CountrySubFamily === 'object' &&
              annex11CountrySubFamily !== null
            ) {
              annex11CountrySubFamilyArr.push(annex11CountrySubFamily)
            }

            annex11RegionSubFamily =
              await getAnnex11ForRegionSvcFmtSubFamily(annex11)
            if (
              typeof annex11RegionSubFamily === 'object' &&
              annex11RegionSubFamily !== null
            ) {
              annex11RegionSubFamilyArr.push(annex11RegionSubFamily)
            }

            annex11AllSubFamily = await getAnnex11ForAllSvcFmtSubFamily(annex11)
            if (
              typeof annex11AllSubFamily === 'object' &&
              annex11AllSubFamily !== null
            ) {
              annex11AllSubFamilyArr.push(annex11AllSubFamily)
            }

            // PHIDP-462

            // FAMILY
            annex11CountryFamily =
              await getAnnex11ForCountrySvcFmtFamily(annex11)
            if (
              typeof annex11CountryFamily === 'object' &&
              annex11CountryFamily !== null
            ) {
              annex11CountryFamilyArr.push(annex11CountryFamily)
            }

            annex11RegionFamily = await getAnnex11ForRegionSvcFmtFamily(annex11)
            if (
              typeof annex11RegionFamily === 'object' &&
              annex11RegionFamily !== null
            ) {
              annex11RegionFamilyArr.push(annex11RegionFamily)
            }

            annex11AllFamily = await getAnnex11ForAllSvcFmtFamily(annex11)
            if (
              typeof annex11AllFamily === 'object' &&
              annex11AllFamily !== null
            ) {
              annex11AllFamilyArr.push(annex11AllFamily)
            }

            // DEFAULT, 99999
            annex11CountryDefault = await getAnnex11ForAllSvcFmtCountry(annex11)
            if (
              typeof annex11CountryDefault === 'object' &&
              annex11CountryDefault !== null
            ) {
              annex11CountryDefaultArr.push(annex11CountryDefault)
            }

            annex11RegionDefault = await getAnnex11ForAllSvcFmtRegion(annex11)
            if (
              typeof annex11RegionDefault === 'object' &&
              annex11RegionDefault !== null
            ) {
              annex11RegionDefaultArr.push(annex11RegionDefault)
            }

            annex11AllDefault = await getAnnex11ForAllSvcFmt(annex11)
            if (
              typeof annex11AllDefault === 'object' &&
              annex11AllDefault !== null
            ) {
              annex11AllDefaultArr.push(annex11AllDefault)
            }
          }
        )
        await Promise.all(promises)
      }

      // SPECIES ARRAY
      if (
        a11RulesFetched === false &&
        Array.isArray(annex11CountrySpeciesArr) &&
        annex11CountrySpeciesArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11CountrySpeciesArr.length > 0')
        plantInfo.annex11RulesArr = annex11CountrySpeciesArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11RegionSpeciesArr) &&
        annex11RegionSpeciesArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11RegionSpeciesArr.length > 0')
        plantInfo.annex11RulesArr = annex11RegionSpeciesArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11AllSpeciesArr) &&
        annex11AllSpeciesArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11AllSpeciesArr.length > 0')
        plantInfo.annex11RulesArr = annex11AllSpeciesArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      // GENUS ARRAY
      if (
        a11RulesFetched === false &&
        Array.isArray(annex11CountryGenusArr) &&
        annex11CountryGenusArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11CountryGenusArr.length > 0')
        plantInfo.annex11RulesArr = annex11CountryGenusArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11RegionGenusArr) &&
        annex11RegionGenusArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11RegionGenusArr.length > 0')
        plantInfo.annex11RulesArr = annex11RegionGenusArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11AllGenusArr) &&
        annex11AllGenusArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11AllGenusArr.length > 0')
        plantInfo.annex11RulesArr = annex11AllGenusArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }
      // PHIDP-462
      // SUB-FAMILY ARRAY
      if (
        a11RulesFetched === false &&
        Array.isArray(annex11CountrySubFamilyArr) &&
        annex11CountrySubFamilyArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11CountrySubFamilyArr.length > 0')
        plantInfo.annex11RulesArr =
          annex11CountrySubFamilyArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11RegionSubFamilyArr) &&
        annex11RegionSubFamilyArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11RegionSubFamilyArr.length > 0')
        plantInfo.annex11RulesArr = annex11RegionSubFamilyArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11AllSubFamilyArr) &&
        annex11AllSubFamilyArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11AllSubFamilyArr.length > 0')
        plantInfo.annex11RulesArr = annex11AllSubFamilyArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      // PHIDP-462

      // FAMILY ARRAY
      if (
        a11RulesFetched === false &&
        Array.isArray(annex11CountryFamilyArr) &&
        annex11CountryFamilyArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11CountryFamilyArr.length > 0')
        plantInfo.annex11RulesArr = annex11CountryFamilyArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11RegionFamilyArr) &&
        annex11RegionFamilyArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11RegionFamilyArr.length > 0')
        plantInfo.annex11RulesArr = annex11RegionFamilyArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11AllFamilyArr) &&
        annex11AllFamilyArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11AllFamilyArr.length > 0')
        plantInfo.annex11RulesArr = annex11AllFamilyArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      // DEFAULT ARRAY
      if (
        a11RulesFetched === false &&
        Array.isArray(annex11CountryDefaultArr) &&
        annex11CountryDefaultArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11CountryDefaultArr.length > 0')
        plantInfo.annex11RulesArr = annex11CountryDefaultArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11RegionDefaultArr) &&
        annex11RegionDefaultArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11RegionDefaultArr.length > 0')
        plantInfo.annex11RulesArr = annex11RegionDefaultArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      if (
        a11RulesFetched === false &&
        Array.isArray(annex11AllDefaultArr) &&
        annex11AllDefaultArr.length > 0 &&
        plantInfo.outcome.toLowerCase() !== 'prohibited'
      ) {
        logger.info('annex11AllDefaultArr.length > 0')
        plantInfo.annex11RulesArr = annex11AllDefaultArr?.sort(sortAnnex11)
        a11RulesFetched = true
      }

      logger.info('getAnnex11Rules: ' + counter)
      return plantInfo
    }

    async function getCountryIndicators() {
      const region = prohibitedObj.countryDetails.REGION

      const rawRegionArray = region?.split(';')
      const formatedRegionArr = []

      rawRegionArray?.forEach(function (reg) {
        const regionIndicator = reg.replace(/[()\s-]+/g, '') // replace brackets in region indicator with empty string
        formatedRegionArr.push(regionIndicator.split(','))
      })

      return formatedRegionArr
    }
    // #endregion

    // #region UN-PROHIBITED CHECKS-------------------------------------------------------
    async function unprohibitedCheckAtHostRefCountryLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at HOST_REF, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                prohibitedObj.hostRef.toString() &&
              annex.COUNTRY_NAME.toLowerCase() ===
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(` Un-Prohibited check APPLICABLE at HOST_REF, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at HOST_REF, Country level')
      }

      logger.info('unprohibitedCheckAtHostRefCountryLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtHostRefRegionLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at HOST_REF, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                prohibitedObj.hostRef.toString() &&
              annex.COUNTRY_NAME.toLowerCase() !==
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
              const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
              const annex6RegionValue = annex6Region.split(',')[1]

              // get the region from countries collection
              const regionArr = await getCountryIndicators()
              regionArr.forEach(async function (reg) {
                if (reg[0] === 'EUSL_INDICATOR')
                  plantInfo.isEUSL = reg[1].toLowerCase()

                // check if region level entry exists for Annex 6
                if (
                  reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                  reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                ) {
                  await setPlantAttributes(annex, 'up')
                  annexMatched = true
                  logger.info(`Un-Prohibited check APPLICABLE at HOST_REF, REGION level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
                }
              })
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at HOST_REF, REGION level')
      }

      logger.info('unprohibitedCheckAtHostRefRegionLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtHostRefAllLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED check at ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                prohibitedObj.hostRef.toString() &&
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at HOST_REF, ALL level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
            ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at HOST_REF, All level')
      }

      logger.info('unprohibitedCheckAtHostRefAllLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtGenusCountryLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at GENUS, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() ===
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at GENUS, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at GENUS, COUNTRY level')
      }

      logger.info('unprohibitedCheckAtGenusCountryLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtGenusRegionLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at GENUS, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() !==
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
              const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
              const annex6RegionValue = annex6Region.split(',')[1]

              // get the region from countries collection
              const regionArr = await getCountryIndicators()
              regionArr.forEach(async function (reg) {
                if (reg[0] === 'EUSL_INDICATOR')
                  plantInfo.isEUSL = reg[1].toLowerCase()

                // check if region level entry exists for Annex 6
                if (
                  reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                  reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                ) {
                  await setPlantAttributes(annex, 'up')
                  annexMatched = true
                  logger.info(`Un-Prohibited check APPLICABLE at GENUS, REGION level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
                }
              })
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at GENUS, REGION level')
      }

      logger.info('unprohibitedCheckAtGenusRegionLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckkAtGenusAllLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED check at GENUS, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() === String(annex.PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at GENUS, ALL level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
            ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at GENUS, All level')
      }

      logger.info('unprohibitedCheckkAtGenusAllLevel: ' + counter)
      return plantInfo
    }

    // PHIDP-462
    async function unprohibitedCheckAtSubFamilyCountryLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at SUB-FAMILY, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() ===
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at SUB-FAMILY, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'UN-PROHIBITED check APPLICABLE at SUB-FAMILY, COUNTRY level'
        )
      }

      logger.info('unprohibitedCheckAtSubFamilyCountryLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtSubFamilyRegionLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at SUB-FAMILY, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() !==
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
              const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
              const annex6RegionValue = annex6Region.split(',')[1]

              // get the region from countries collection
              const regionArr = await getCountryIndicators()
              regionArr.forEach(async function (reg) {
                if (reg[0] === 'EUSL_INDICATOR')
                  plantInfo.isEUSL = reg[1].toLowerCase()

                // check if region level entry exists for Annex 6
                if (
                  reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                  reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                ) {
                  await setPlantAttributes(annex, 'up')
                  annexMatched = true
                  logger.info(`Un-Prohibited check APPLICABLE at SUB-FAMILY, REGION level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
                }
              })
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info(
          'UN-PROHIBITED check APPLICABLE at SUB-FAMILY, REGION level'
        )
      }

      logger.info('unprohibitedCheckAtSubFamilyRegionLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtSubFamilyAllLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED check at SUB-FAMILY, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GRAND_PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at SUB-FAMILY, ALL level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
            ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at SUB-FAMILY, All level')
      }

      logger.info('unprohibitedCheckAtSubFamilyAllLevel: ' + counter)
      return plantInfo
    }

    // PHIDP-462
    async function unprohibitedCheckAtFamilyCountryLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at FAMILY, COUNTRY level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() ===
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at FAMILY, COUNTRY level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
              ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at FAMILY, COUNTRY level')
      }

      logger.info('unprohibitedCheckAtFamilyCountryLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtFamilyRegionLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED checks at FAMILY, REGION level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() !==
                prohibitedObj.country.toLowerCase() &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              const annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
              const annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
              const annex6RegionValue = annex6Region.split(',')[1]

              // get the region from countries collection
              const regionArr = await getCountryIndicators()
              regionArr.forEach(async function (reg) {
                if (reg[0] === 'EUSL_INDICATOR')
                  plantInfo.isEUSL = reg[1].toLowerCase()

                // check if region level entry exists for Annex 6
                if (
                  reg[0]?.toLowerCase() === annex6RegionType?.toLowerCase() &&
                  reg[1]?.toLowerCase() === annex6RegionValue?.toLowerCase()
                ) {
                  await setPlantAttributes(annex, 'up')
                  annexMatched = true
                  logger.info(`Un-Prohibited check APPLICABLE at FAMILY, REGION level, ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
                ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
                }
              })
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at FAMILY, REGION level')
      }

      logger.info('unprohibitedCheckAtFamilyRegionLevel: ' + counter)
      return plantInfo
    }

    async function unprohibitedCheckAtFamilyAllLevel() {
      let annexMatched = false
      logger.info('Starting UN-PROHIBITED check at FAMILY, ALL level')
      counter += 1

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        const annexPromises = plantDocument.HOST_REGULATION.ANNEX6.map(
          async (annex) => {
            if (
              annex.HOST_REF.toString() === prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() !==
                prohibitedObj.hostRef.toString() &&
              annex.PHI_HOST_REF.toString() ===
                String(annex.GREAT_GRAND_PARENT_HOST_REF) &&
              annex.COUNTRY_NAME.toLowerCase() === 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
                prohibitedObj.serviceFormat.toLowerCase() &&
              annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' &&
              annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === ''
            ) {
              await setPlantAttributes(annex, 'up')
              annexMatched = true
              logger.info(`Un-Prohibited check APPLICABLE at FAMILY, ALL level,  ${annex.A6_RULE}, ${annex.COUNTRY_NAME}, 
            ${prohibitedObj.country},  ${annex.SERVICE_FORMAT}`)
            }
          }
        )
        await Promise.all(annexPromises)
      }

      if (annexMatched === true) await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        logger.info('UN-PROHIBITED check APPLICABLE at FAMILY, All level')
      }

      logger.info('unprohibitedCheckAtFamilyAllLevel: ' + counter)
      return plantInfo
    }

    async function noAnnex6ItsUnprohibited() {
      logger.info(
        'Starting UN-PROHIBITED check for Region/All with NO Annex6 entries'
      )

      await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0) {
        plantInfo.outcome = 'un-prohibited'
        logger.info(
          `UN-PROHIBITED check APPLICABLE country: ', ${prohibitedObj.country}}`
        )
      }

      logger.info('noAnnex6ItsUnprohibited: ' + counter)
      return plantInfo
    }

    // #endregion

    async function getPests() {
      counter += 1

      const importCountry = prohibitedObj.country.toLowerCase()
      // Get the pests corresponding to the country
      const pestArray = []

      function pestNames(plantDocument) {
        for (let i = 0; i < plantDocument.PEST_LINK.length; i++) {
          for (
            let j = 0;
            j < plantDocument.PEST_LINK[i].PEST_COUNTRY.length;
            j++
          ) {
            if (
              plantDocument.PEST_LINK[i].PEST_COUNTRY[
                j
              ].COUNTRY_NAME.toLowerCase() === importCountry &&
              plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR !== '' &&
              plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR !== null
            ) {
              if (
                plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR === 'R' &&
                prohibitedObj.serviceFormat.toLowerCase() ===
                  'plants for planting'
              ) {
                pestArray.push({
                  csl_ref: plantDocument.PEST_LINK[i].CSL_REF.toString(),
                  name: plantDocument.PEST_LINK[i].PEST_NAME,
                  format: plantDocument.PEST_LINK[i].FORMAT,
                  quarantine_indicator:
                    plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR,
                  regulated_indicator:
                    plantDocument.PEST_LINK[i].REGULATION_INDICATOR,
                  regulation_category:
                    plantDocument.PEST_LINK[i].REGULATION_CATEGORY,
                  pest_country: plantDocument.PEST_LINK[i].PEST_COUNTRY[j]
                })
              } else {
                if (plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR !== 'R') {
                  pestArray.push({
                    csl_ref: plantDocument.PEST_LINK[i].CSL_REF.toString(),
                    name: plantDocument.PEST_LINK[i].PEST_NAME,
                    format: plantDocument.PEST_LINK[i].FORMAT,
                    quarantine_indicator:
                      plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR,
                    regulated_indicator:
                      plantDocument.PEST_LINK[i].REGULATION_INDICATOR,
                    regulation_category:
                      plantDocument.PEST_LINK[i].REGULATION_CATEGORY,
                    pest_country: plantDocument.PEST_LINK[i].PEST_COUNTRY[j]
                  })
                }
              }
            }
          }
        }

        return pestArray
      }

      plantInfo.pestDetails = pestNames(plantDocument)
      logger.info('getPests: ' + counter)
      return plantInfo
    }
  }
}

export { ProhibitedStrategy }
