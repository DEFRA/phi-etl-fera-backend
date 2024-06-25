import { countBy } from 'lodash'
import { workflowEngine } from './workflowEngine'

let logger = ''
let plantInfo = ''
let plantDocument = ''
const pestDetails = []
let [annexRegionType, annexRegionValue] = ''
let innsProhibitedObj = ''
let prohibitionConditionMet = false

class ProhibitedStrategy extends workflowEngine {
  constructor(plantDocument, searchInput, countryMapping, cdpLogger) {
    super(plantDocument, searchInput, countryMapping, cdpLogger)
    // this.type = ['6A1', '6B5']
    this.decision = 'prohibited'
    logger = this.loggerObj
    innsProhibitedObj = this
  }

  async execute() {
    logger.info('Check if Annex6 (PROHIBITED) rule applies?')

    plantDocument = this.data
    plantInfo = {
      hostRef: this.hostRef,
      country: this.country,
      eppoCode: plantDocument.EPPO_CODE,
      plantName: plantDocument.PLANT_NAME,
      annexSixRule: '',
      annexElevenRule: '',
      outcome: '',
      pestDetails,
      annex11:[],
      isEUSL: false
    }


    prohibitionCheckAtCountryLevel()
    if (prohibitionConditionMet === false) {partiallyProhibitionCheckAtCountryLevel()}
    if (prohibitionConditionMet === false) {partiallyProhibitionCheckAtRegionLevel()}
    if (prohibitionConditionMet === false) {checkIfFullyProhibited()}
    if (prohibitionConditionMet === false) {getUnprohibitedAnnex11Rules()}
    getPests()
    logger.info('Annex6 (PROHIBITED) check performed')

    return plantInfo

   // Level 1 check: Go through host regulations to check if ANNEX6 (Prohibited) rule is applicable
   // at country level?
   function prohibitionCheckAtCountryLevel()
    {
    logger.info('Level 1: Starting Prohibited check at country level')
    
    if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() === innsProhibitedObj.country.toLowerCase() &&
          annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() 
          // && innsProhibitedObj.type.map((t) => t.toLowerCase().includes(annex.A6_RULE.toLowerCase()))
           //&& annex.OVERALL_DECISION.toLowerCase() === this.decision.toLowerCase()
           && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
           && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
           &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')
          ) 
           {
          logger.info(
            `Annex6 (PROHIBITED) rule applicable at country level, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
          prohibitionConditionMet = true
        }
      })
    }
    return plantInfo
  }

  // Level 2 check: Go through host regulations to check if ANNEX6 (PARTIALLY PROHIBITED) 
  // rule is applicable at Country level?
  function partiallyProhibitionCheckAtCountryLevel(){ 
    logger.info('Level 2A: Starting PARTIALLY PROHIBITED check at Country level')
    
    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 2A.1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() === innsProhibitedObj.country.toLowerCase() && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            ( annex.HYBRID_INDICATOR === this.subformat || annex.DORMANT_INDICATOR === this.subformat
            || annex.SEED_INDICATOR === this.subformat ||  annex.FRUIT_INDICATOR === this.subformat  
            ||  annex.BONSAI_INDICATOR === this.subformat ||  annex.INVINTRO_INDICATOR === this.subformat)
        ) {
              // Fetch applicable Annex11 Rules at country level
              if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)){
                let counter = 0
                plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                if (innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()
                    && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                      this.annex11.push(annex11)
                      counter++
                  }})}
                
                if (counter > 0)
                {
                  prohibitionConditionMet = true
                  plantInfo.outcome = annex.OVERALL_DECISION
                }

              // If no Annex11 rules found at country level, get from rules for 'all' countries
              // if (counter === 0){
              //   plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
              //     if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
              //         && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
              //           this.annex11.push(annex11)
              //           counter++
              //       }
              // })}

              if (counter > 0)
              {
                prohibitionConditionMet = true
                plantInfo.outcome = annex.OVERALL_DECISION
              }
        }
      })
    }

    return plantInfo
  }

  // Level 2 check: Go through host regulations to check if ANNEX6 (PARTIALLY PROHIBITED) 
  // rule is applicable at 'Region' or 'All' level?
  function partiallyProhibitionCheckAtRegionLevel(){ 
    logger.info('Level 2B: Starting PARTIALLY PROHIBITED check at Region/All level')
    let regionValue = ''

    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 2B.1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() !== innsProhibitedObj.country.toLowerCase() && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            ( annex.HYBRID_INDICATOR === this.subformat || annex.DORMANT_INDICATOR === this.subformat
            || annex.SEED_INDICATOR === this.subformat ||  annex.FRUIT_INDICATOR === this.subformat  
            ||  annex.BONSAI_INDICATOR === this.subformat ||  annex.INVINTRO_INDICATOR === this.subformat)
        ) {

          regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          annexRegionType = regionValue.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
          annexRegionValue = regionValue.split(',')[1]

              const region = innsProhibitedObj.countryDetails.REGION
              const regionArray = region.split(';')
              let regionIndicator = ''

              regionArray.forEach(function (reg) {
                regionIndicator = reg.replace(/[()\s-]+/g, '')
                regionValue = regionIndicator.split(',')

                if (regionIndicator === 'EUSL_INDICATOR')
                plantInfo.isEUSL = regionValue[1].toLowerCase()
              
                logger.info(`formatted region is: ${regionValue[0]}, ${regionValue[1]}`)

                if (regionValue[0].toLowerCase() === annexRegionType.toLowerCase() &&
                  regionValue[1].toLowerCase() === annexRegionValue.toLowerCase()) {
                  logger.info(`Annex6 (PARTIALLY PROHIBITED) rule applicable at country/all level, ${annex.A6_RULE}`)
                  // plantInfo.annexSixRule = annex.A6_RULE
                  // plantInfo.outcome = annex.OVERALL_DECISION
                  // prohibitionConditionMet = true

                  // Check for Annex11 rules at 'Region' Level  
                  plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                  if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
                      && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                        this.annex11.push(annex11)
                        counter++
                    }

                  // Check for Annex11 rules at 'All' Level  
                  plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                    if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
                        && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                          this.annex11.push(annex11)
                          counter++
                      }

                })
              })
            }

              // // Fetch applicable Annex11 Rules at country level
              // if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)){
              //   let counter = 0
              //   plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
              //   if (innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()
              //       && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
              //         this.annex11.push(annex11)
              //         counter++
              //     }})}
                
              //   if (counter > 0)
              //   {
              //     prohibitionConditionMet = true
              //     plantInfo.outcome = annex.OVERALL_DECISION
              //   }

              // // If no Annex11 rules found at country level, get from rules for 'all' countries
              // if (counter === 0){
              //   plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
              //     if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
              //         && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
              //           this.annex11.push(annex11)
              //           counter++
              //       }
              // })}

              // if (counter > 0)
              // {
              //   prohibitionConditionMet = true
              //   plantInfo.outcome = annex.OVERALL_DECISION
              // }
        })
      }
    


  })
}
return plantInfo
  }


// Level 3 check: Go through host regulations to check if ANNEX6 (FULLY PROHIBITED) 
// rule is applicable at 'Region' or 'All' level?
function checkIfFullyProhibited(){
  logger.info('Level 3: Starting FULLY PROHIBITED check at Region/All level')
  let regionValue = ''
        // Determine if 100% prohibited

        if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
          plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() 
          // && annex.OVERALL_DECISION.toLowerCase() === innsProhibitedObj.decision.toLowerCase()
          && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
          && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
          &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')) {
         
          logger.info('Step 3.1 (match Annex Country Name with Country Details')

          regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          annexRegionType = regionValue.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
          annexRegionValue = regionValue.split(',')[1]

          if (annexRegionValue !== innsProhibitedObj.country) {
            const region = innsProhibitedObj.countryDetails.REGION
            const regionArray = region.split(';')
            let regionIndicator = ''
            let regionValue = ''

            regionArray.forEach(function (reg) {
              regionIndicator = reg.replace(/[()\s-]+/g, '')
              regionValue = regionIndicator.split(',')

              if (regionIndicator === 'EUSL_INDICATOR')
              plantInfo.isEUSL = regionValue[1].toLowerCase()
             
              logger.info(
                `formatted region is: ${regionValue[0]}, ${regionValue[1]}`
              )

              if (regionValue[0].toLowerCase() === annexRegionType.toLowerCase() &&
                regionValue[1].toLowerCase() === annexRegionValue.toLowerCase()) {
                logger.info(`Annex6 (PROHIBITED) rule applicable at country/all level, ${annex.A6_RULE}`)
                plantInfo.annexSixRule = annex.A6_RULE
                plantInfo.outcome = annex.OVERALL_DECISION
                prohibitionConditionMet = true
              }
            })
          }
        }
      })
    }

    return plantInfo
  }

  function getPests(){
    const importCountry = innsProhibitedObj.country.toLowerCase()
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
                plantDocument.PEST_LINK[i].REGUALTION_CATEGORY,
              pest_country: plantDocument.PEST_LINK[i].PEST_COUNTRY[j]
            })
          }
        }
      }
      pestArray = pestArray.sort(compareQuarantineIndicator)
      return pestArray
    }

    plantInfo.pestDetails = pestNames(plantDocument)
    return plantInfo
  }
  
  function getUnprohibitedAnnex11Rules()
  {
    logger.info('Level 4: Starting UN-PROHIBITED checks')
    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 4.1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() === innsProhibitedObj.country.toLowerCase() && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited'
        ) {
              // Fetch applicable Annex11 Rules at country level
              if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)){
                let counter = 0
                plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                if (innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()
                    && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                      this.annex11.push(annex11)
                      counter++
                  }})}
                
                if (counter > 0)
                {
                  prohibitionConditionMet = 
                  plantInfo.outcome = annex.OVERALL_DECISION
                }

              // If no Annex11 rules found at country level, get from rules for 'all' countries
              if (counter === 0){
                plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                  if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
                      && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                        this.annex11.push(annex11)
                        counter++
                    }
              })}

              if (counter > 0)
              {
                prohibitionConditionMet = true
                plantInfo.outcome = annex.OVERALL_DECISION
              }
        }
      })
    }
    return plantInfo
  }
}
}

export { ProhibitedStrategy }
