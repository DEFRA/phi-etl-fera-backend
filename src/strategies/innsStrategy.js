import { workflowEngine } from './workflowEngine'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()
let plantInfo = ''
let pestDetails = ''

class innsStrategy extends workflowEngine {
  constructor(plantDocument, searchInput) {
    super(plantDocument, searchInput)
    this.type = 'INNS'
  }

  async execute() {
    logger.info('Checking for Annex6 (INNS) rule')
    const plantDocument = this.data
    if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() === this.country.toLowerCase() &&
          annex.SERVICE_FORMAT.toLowerCase() ===
            this.serviceFormat.toLowerCase() && annex.A6_RULE.toLowerCase() === this.type.toLowerCase()
        ) {
            this.outcome = annex.OVERALL_DECISION
            this.checkComplete = true
            this.annexSixRuleType = annex.A6_RULE
            this.annexElevenRuleType = ''
        }
      })
    }

    if (this.checkComplete) {
      logger.info('Annex6 (INNS) rule is true')
      pestDetails = {
        pestNames: this.data.PEST_LINK.map((item) => {
          return item.PEST_NAME
        }),
        pestFormats: this.data.PEST_LINK.map((item) => {
          return item.FORMAT
        })
      }

      plantInfo = {
        hostRef: this.hostRef,
        eppoCode: this.data.EPPO_CODE,
        plantName: this.data.PLANT_NAME,
        outcome: this.outcome,
        annexSixRule: this.annexSixRuleType,
        annexElevenRule: this.annexElevenRuleType,
        pestDetails
      }
    }

    logger.info('Annex6 (INNS) check completed')
    return plantInfo
  }
}
export { innsStrategy }
