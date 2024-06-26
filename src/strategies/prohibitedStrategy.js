import { workflowEngine } from './workflowEngine'

let logger = ''
let plantInfo = ''
let plantDocument = ''
const pestDetails = []
let [annex6RegionType, annex6RegionValue] = ''
let [annex11RegionType, annex11RegionValue] = ''
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
      annex11RulesArr:[],
      isEUSL: false,
      all: false
    }

    // Start with prohibition checks
    prohibitionCheckAtCountryLevel()
    if (prohibitionConditionMet === false) {prohibitionCheckAtRegionLevel()}
    if (prohibitionConditionMet === false) {prohibitionCheckAllLevel()}

    // move to partially-prohibited checks
    if (prohibitionConditionMet === false) {partiallyProhibitionCheckAtCountryLevel()}
    if (prohibitionConditionMet === false) {partiallyProhibitionCheckAtRegionLevel()}
    if (prohibitionConditionMet === false) {partiallyProhibitionCheckAtAllLevel()}

    // move to un-prohibited checks
    if (prohibitionConditionMet === false) {getUnprohibitedAnnex11RulesAtCountryLevel()}

    // finall, get the pests
    getPests()

    logger.info('Annex6 (PROHIBITED) checks performed')

    return plantInfo

   // Level 1A check: Go through host regulations to check if ANNEX6 (PROHIBITED) rule is applicable
   // at the country level?
   function prohibitionCheckAtCountryLevel()
    {
    logger.info('Level 1A: Starting Prohibited check at COUNTRY level')
    
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
            `Annex6 (PROHIBITED) rule applicable at COUNTRY level, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
          prohibitionConditionMet = true
        }
      })
    }
    return plantInfo
  }

// Level 1B check: Go through host regulations to check if ANNEX6 (PROHIBITED) 
// rule is applicable at 'Region' ?
function prohibitionCheckAtRegionLevel(){
  logger.info('Level 1B: Starting Prohibition check at REGION level')
  let regionValue = ''
        if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
          plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() !== innsProhibitedObj.country.toLowerCase()
          && annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() 
          // && annex.OVERALL_DECISION.toLowerCase() === innsProhibitedObj.decision.toLowerCase()
          && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
          && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
          &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')) {
         
          logger.info('Step 1B.1 (match Annex at region level')

          regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          annex6RegionType = regionValue.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
          annex6RegionValue = regionValue.split(',')[1]

            let regionArr = getCountryIndicators() 
            regionArr.forEach(function (reg) {
  
              if (reg[0] === 'EUSL_INDICATOR')
              plantInfo.isEUSL = reg[1].toLowerCase()
             
              logger.info(
                `formatted region is: ${reg[0]}, ${reg[1]}`
              )

              if (reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                  reg[1].toLowerCase() === annex6RegionValue.toLowerCase()) {
                  logger.info(`Annex6 (PROHIBITED) rule applicable at REGION level, ${annex.A6_RULE}`)
                  plantInfo.annexSixRule = annex.A6_RULE
                  plantInfo.outcome = annex.OVERALL_DECISION
                  prohibitionConditionMet = true
              }
            })
          }
        })
      }
    
    return plantInfo
  }

  // Level 1C check: Go through host regulations to check if ANNEX6 (PROHIBITED) 
// rule is applicable at 'All' ?
function prohibitionCheckAllLevel(){
  logger.info('Level 1C: Starting Prohibition check at ALL level')
  let regionValue = ''
        if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
          plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() === 'all'
          && annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() 
          // && annex.OVERALL_DECISION.toLowerCase() === innsProhibitedObj.decision.toLowerCase()
          && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
          && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
          &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')) {
         
          logger.info('Step 1C.1 (match Annex at ALL level')

          logger.info(`Annex6 (PROHIBITED) rule applicable at ALL level, ${annex.A6_RULE}`)
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
          prohibitionConditionMet = true
              }

          })
      }
    
    return plantInfo
  }

  // Level 2A check: Go through host regulations to check if ANNEX6 (PARTIALLY PROHIBITED) 
  // rule is applicable at the Country level?
  function partiallyProhibitionCheckAtCountryLevel(){ 
    logger.info('Level 2A: Starting PARTIALLY PROHIBITED check at Country level')
    
    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 2A.1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
          // check if atlease 1 exemptio exists
            annex.COUNTRY_NAME.toLowerCase() === innsProhibitedObj.country.toLowerCase() && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            ( annex.HYBRID_INDICATOR === plantInfo.subformat || annex.DORMANT_INDICATOR === plantInfo.subformat
            || annex.SEED_INDICATOR === plantInfo.subformat ||  annex.FRUIT_INDICATOR === plantInfo.subformat  
            ||  annex.BONSAI_INDICATOR === plantInfo.subformat ||  annex.INVINTRO_INDICATOR === plantInfo.subformat)
        ) {
              // Fetch applicable Annex11 Rules at country level
              if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)){
                plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                if (innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()
                    && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                      plantInfo.annex11RulesArr.push(annex11)
                  }})}

         }
      })
    }
                
    if (plantInfo.annex11RulesArr.length > 0)
    {
      prohibitionConditionMet = true
      plantInfo.outcome = annex.OVERALL_DECISION
    }

    return plantInfo
  }

  // Level 2B check: Go through host regulations to check if ANNEX6 (PARTIALLY PROHIBITED) 
  // rule is applicable at the 'Region' level?
  function partiallyProhibitionCheckAtRegionLevel(){ 
    logger.info('Level 2B: Starting PARTIALLY PROHIBITED check at REGION level')
    let annex6Region = ''
    let annex11Region = ''

    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 2B.1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if ( // get rules for the region of the input country
            (annex.COUNTRY_NAME.toLowerCase() !== innsProhibitedObj.country.toLowerCase()
             && annex.COUNTRY_NAME.toLowerCase() !== 'all') &&
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            ( annex.HYBRID_INDICATOR === plantInfo.subformat || annex.DORMANT_INDICATOR === plantInfo.subformat
            || annex.SEED_INDICATOR === plantInfo.subformat ||  annex.FRUIT_INDICATOR === plantInfo.subformat  
            ||  annex.BONSAI_INDICATOR === plantInfo.subformat ||  annex.INVINTRO_INDICATOR === plantInfo.subformat)
        ) {

          annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          annex6RegionType = annex6Region.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
          annex6RegionValue = annex6Region.split(',')[1]

          // get the region from countries collection
          let regionArr = getCountryIndicators() 
          regionArr.forEach(function (reg) {

            if (reg[0] === 'EUSL_INDICATOR')
            plantInfo.isEUSL = reg[1].toLowerCase()
           
            logger.info(
              `formatted region is: ${reg[0]}, ${reg[1]}`
            )

            // check if region level entry exists for Annex 6
            if (reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                reg[1].toLowerCase() === annex6RegionValue.toLowerCase()) {
                  logger.info(`Annex6 (PARTIALLY PROHIBITED) rule applicable at REGION level, ${annex.A6_RULE}`)

                  // Get Annex11 rules at for the matched 'Region'  
                  plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                    annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                    annex11RegionType = annex11Region.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                    annex11RegionValue = annex11Region.split(',')[1]
  
                  if (reg[0].toLowerCase() === annex11RegionType.toLowerCase()&&
                      reg[1].toLowerCase() === annex11RegionValue.toLowerCase()
                      && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                        plantInfo.annex11RulesArr.push(annex11)
                     
                    }
              })
            }
          })
      }
  })
}
               
if (plantInfo.annex11RulesArr.length > 0)
{
  prohibitionConditionMet = true
  plantInfo.outcome = annex.OVERALL_DECISION
}

return plantInfo
  }

 // Level 2C check: Go through host regulations to check if ANNEX6 (PARTIALLY PROHIBITED) 
  // rule is applicable to 'All' countries?
  function partiallyProhibitionCheckAtAllLevel(){ 
    logger.info('Level 2C: Starting PARTIALLY PROHIBITED check at ALL level')

    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 2C.1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            ( annex.HYBRID_INDICATOR === plantInfo.subformat || annex.DORMANT_INDICATOR === plantInfo.subformat
            || annex.SEED_INDICATOR === plantInfo.subformat ||  annex.FRUIT_INDICATOR === plantInfo.subformat  
            ||  annex.BONSAI_INDICATOR === plantInfo.subformat ||  annex.INVINTRO_INDICATOR === plantInfo.subformat)
        ) {
                  // Check for Annex11 rules at 'All' Level  
                  plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                  if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
                      && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                        plantInfo.annex11RulesArr.push(annex11)
                    }
                })
              }
          })
        }

        if (plantInfo.annex11RulesArr.length > 0)
        {
          plantInfo.all = true
          prohibitionConditionMet = true
          plantInfo.outcome = annex.OVERALL_DECISION
        }
  
        return plantInfo
  }

  function getCountryIndicators(){
    const region = innsProhibitedObj.countryDetails.REGION
    const rawRegionArray = region.split(';')
    let regionIndicator = ''
    let formatedRegionArr = ''

    rawRegionArray.forEach(function (reg) {
      regionIndicator = reg.replace(/[()\s-]+/g, '') // replace brackets in region indicator with empty string
      formatedRegionArr = regionIndicator.split(',')})

    return formatedRegionArr
  }

  function getUnprohibitedAnnex11RulesAtCountryLevel()
  {
    logger.info('Level 3A: Starting UN-PROHIBITED checks at COUNTRY level')
    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 3A (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() === innsProhibitedObj.country.toLowerCase() && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited'
            && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
            && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
            &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')
        ) {
              // Fetch applicable Annex11 Rules at country level
              if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)){

                plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                if (innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()
                    && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                      plantInfo.annex11RulesArr.push(annex11)

                  }})}
   
        }
      })
    }

    if (plantInfo.annex11RulesArr.length > 0)
        {
          prohibitionConditionMet = true
          plantInfo.outcome = annex.OVERALL_DECISION
        }
  }

  function getUnprohibitedAnnex11RulesAtRegionLevel()
  {
    logger.info('Level 3B: Starting UN-PROHIBITED checks at REGION level')
    let annex6Region = ''
    let annex11Region = ''

    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 3B (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() !== innsProhibitedObj.country.toLowerCase() && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited'
            && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
            && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
            &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')
        ) {

          annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          annex6RegionType = annex6Region.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
          annex6RegionValue = annex6Region.split(',')[1]

          // get the region from countries collection
          let regionArr = getCountryIndicators() 
          regionArr.forEach(function (reg) {

            if (reg[0] === 'EUSL_INDICATOR')
            plantInfo.isEUSL = reg[1].toLowerCase()
           
            logger.info(
              `formatted region is: ${reg[0]}, ${reg[1]}`
            )

            // check if region level entry exists for Annex 6
            if (reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                reg[1].toLowerCase() === annex6RegionValue.toLowerCase()) {
                  logger.info(`Annex6 (UN-PROHIBITED) rule applicable at REGION level, ${annex.A6_RULE}`)

                  // Get Annex11 rules at for the matched 'Region'  
                  plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                    annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                    annex11RegionType = annex11Region.split(',')[0]  // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                    annex11RegionValue = annex11Region.split(',')[1]
  
              // Fetch applicable Annex11 Rules at country level
              if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)){

                plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                  if (reg[0].toLowerCase() === annex11RegionType.toLowerCase()&&
                  reg[1].toLowerCase() === annex11RegionValue.toLowerCase()
                  && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                    plantInfo.annex11RulesArr.push(annex11)
                  }
                
                })
   
        }
      })
      }
    })
  }
})}
    
    if (plantInfo.annex11RulesArr.length > 0)
        {
          prohibitionConditionMet = true
          plantInfo.outcome = annex.OVERALL_DECISION
        }
  
  return plantInfo
}

// Level 3C check: Go through host regulations to check if ANNEX6 (UN-PROHIBITED) 
  // rule is applicable to 'All' countries?
  function getUnprohibitedAnnex11RulesAtAllLevel(){ 
    logger.info('Level 3C: Starting UN-PROHIBITED check at ALL level')

    if ( !plantDocument.outcome && Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(`Step 3C (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`)

        if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' && 
            annex.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited'
            && ( annex.HYBRID_INDICATOR === '' && annex.DORMANT_INDICATOR === ''
            && annex.SEED_INDICATOR === '' &&  annex.FRUIT_INDICATOR === ''  
            &&  annex.BONSAI_INDICATOR === '' &&  annex.INVINTRO_INDICATOR === '')
        ) {
                  // Check for Annex11 rules at 'All' Level  
                  plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
                  if (annex11.COUNTRY_NAME.toLowerCase() === 'all'
                      && annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
                        plantInfo.annex11RulesArr.push(annex11)
                    }
                })
              }
          })
        }

        if (plantInfo.annex11RulesArr.length > 0)
        {
          plantInfo.all = true
          prohibitionConditionMet = true
          plantInfo.outcome = annex.OVERALL_DECISION
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
  }
}


export { ProhibitedStrategy }
