import { workflowEngine } from './workflowEngine'

let logger = ''
let plantInfo = ''
const pestDetails = []
let [property, expectedValue] = ''

class ProhibitedStrategy extends workflowEngine {
  constructor(plantDocument, searchInput, countryMapping, cdpLogger) {
    super(plantDocument, searchInput, countryMapping, cdpLogger)
    this.type = ['6A1', '6B5']
    this.decision = 'prohibited'
    logger = this.loggerObj
  }

  async execute() {
    logger.info('Check if Annex6 (PROHIBITED) rule applies?')

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

    const innsProhibitedObj = this

    // Level 1 check: Go through host regulations to check if ANNEX6 (Prohibited) rule is applicable
    // at country level?
    logger.info('Level 1: Starting Prohibited check at country level')
    if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
          innsProhibitedObj.type.map((t) =>
            t.toLowerCase().includes(annex.A6_RULE.toLowerCase())
          ) &&
          annex.OVERALL_DECISION.toLowerCase() === this.decision.toLowerCase()
        ) {
          logger.info(
            `Annex6 (PROHIBITED) rule applicable at country level, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
        }
      })
    }

    let formattedAnnex = ''
    // Level 2 check: Go through host regulations to check if ANNEX6 (INNS) rule is applicable
    // at 'Region' or 'All' level?
    logger.info('Level 2: Starting Prohibited check at Region/All level')
    if (
      !plantDocument.outcome &&
      Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)
    ) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(
          `Step 1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`
        )

        if (
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
          annex.OVERALL_DECISION.toLowerCase() ===
            innsProhibitedObj.decision.toLowerCase()
        ) {
          logger.info('Step 2 (match Annex Country Name with Country Details')

          formattedAnnex = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          property = formattedAnnex.split(',')[0]
          expectedValue = formattedAnnex.split(',')[1]

          if (expectedValue !== innsProhibitedObj.country) {
            const region = innsProhibitedObj.countryDetails.REGION
            const regionArray = region.split(';')
            let regionItem = ''
            let regionFormatted = ''

            regionArray.forEach(function (reg) {
              regionItem = reg.replace(/[()\s-]+/g, '')
              regionFormatted = regionItem.split(',')
              logger.info(
                `formatted region is: ${regionFormatted[0]}, ${regionFormatted[1]}`
              )

              if (
                regionFormatted[0].toLowerCase() === property.toLowerCase() &&
                regionFormatted[1].toLowerCase() === expectedValue.toLowerCase()
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule applicable at country/all level, ${annex.A6_RULE}`
                )
                plantInfo.annexSixRule = annex.A6_RULE
                plantInfo.outcome = annex.OVERALL_DECISION
              }
            })
          }
        }
      })
    }
    const importCountry = this.country.toLowerCase()
    // Get the pests corresponding to the country
    let pestArray = []

    function compareQuarantineIndicator(a, b) {
      if (a.quarantine_indicator < b.quarantine_indicator) {
        return -1
      }
      if (a.quarantine_indicator > b.quarantine_indicator) {
        return 1
      }
      return 0
    }

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
            plantDocument.PEST_LINK[i].QUARANTINE_INDICATOR !== ''
          ) {
            pestArray.push({
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
      pestArray = pestArray.sort(compareQuarantineIndicator)
      return pestArray
    }

    plantInfo.pestDetails = pestNames(plantDocument)

    logger.info('Annex6 (PROHIBITED) check performed')
    return plantInfo
  }
}
export { ProhibitedStrategy }
