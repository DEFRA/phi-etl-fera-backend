import { WorkflowEngine } from './WorkflowEngine'

let logger = ''
let plantInfo = ''
const pestDetails = []

class InnsStrategy extends WorkflowEngine {
  constructor(
    plantDocument,
    plantNameDoc,
    searchInput,
    countryMapping,
    cdpLogger
  ) {
    super(plantDocument, plantNameDoc, searchInput, countryMapping, cdpLogger)
    this.type = 'INNS'
    this.decision = 'prohibited'
    logger = this.loggerObj
  }

  async execute() {
    logger?.info('Check if Annex6 (INNS) rule applies?')

    const plantDocument = this.data
    plantInfo = {
      hostRef: this.hostRef,
      country: this.country,
      eppoCode: plantDocument.EPPO_CODE,
      plantName: plantDocument.PLANT_NAME,
      annexSixRule: '',
      annexElevenRule: '',
      outcome: '',
      pestDetails
    }

    const innsStrategyObj = this
    // Level 1 check: Go through host regulations to check if ANNEX6 (INNS) rule is applicable
    // at All country level?
    logger?.info('Level 1: Starting INNS check at Region & All level')
    if (
      !plantDocument.outcome &&
      Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)
    ) {
      logger?.info('Inside level 1 INNS check - step 1 ')

      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        if (
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsStrategyObj.serviceFormat.toLowerCase() &&
          annex.A6_RULE.toLowerCase() === innsStrategyObj.type.toLowerCase() &&
          annex.COUNTRY_NAME.toLowerCase() === 'all'
        ) {
          logger?.info('inside level 1 INNS check - step 2 ')

          logger?.info(
            `Annex6 (INNS) rule applicable for 'all' countries, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
        }
      })
    }

    // 10 June, 2024: As per BA team, INNS is not applicable at country level only All level,
    // once this is confirmed the condition will be removed.

    // Level 2 check: Go through host regulations to check if ANNEX6 (INNS) rule is applicable
    // at the country level?
    logger?.info('Level 2: Starting INNS check at country level')
    if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() ===
            innsStrategyObj.country.toLowerCase() &&
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsStrategyObj.serviceFormat.toLowerCase() &&
          annex.A6_RULE.toLowerCase() === innsStrategyObj.type.toLowerCase()
        ) {
          logger?.info('inside level 2 check block ')
          logger?.info(
            `Annex6 (INNS) applicable at country level, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
        }
      })
    }

    // Get the pests corresponding to the country
    const importCountry = innsStrategyObj.country.toLowerCase()
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
              innsStrategyObj.serviceFormat.toLowerCase() ===
                'plants for planting'
            ) {
              pestArray.push({
                csl_ref: plantDocument.PEST_LINK[i].CSL_REF,
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
                  csl_ref: plantDocument.PEST_LINK[i].CSL_REF,
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

    logger?.info('Annex6 (INNS) check performed')
    return plantInfo
  }
}
export { InnsStrategy }
