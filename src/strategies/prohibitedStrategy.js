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

    // Start with prohibition checks
    plantInfo = await prohibitionCheckAtCountryLevel()

    if (!(plantInfo?.outcome === undefined)  ) 
    {
      await prohibitionCheckAtRegionLevel()
    }

    if (!(plantInfo?.outcome === undefined)) 
    {
      await prohibitionCheckAllLevel()
    }

    // move to partially-prohibited checks

      if (!(plantInfo?.outcome === undefined)) 
      {
        await partiallyProhibitionCheckAtCountryLevel()
      }
      if (!(plantInfo?.outcome === undefined)) 
      {
        await partiallyProhibitionCheckAtRegionLevel()
      }
      if (!(plantInfo?.outcome === undefined)) 
      {
        await partiallyProhibitionCheckAtAllLevel()
      }

    // move to un-prohibited checks
    if (!(plantInfo?.outcome === undefined)) 
    {
      await getUnprohibitedAnnex11RulesAtCountryLevel()
    }
    if (!(plantInfo?.outcome === undefined)) 
    {
       await getUnprohibitedAnnex11RulesAtRegionLevel()
    }
    if (!(plantInfo?.outcome === undefined)) 
    {
      await getUnprohibitedAnnex11RulesAtAllLevel()
    }

    if (!(plantInfo?.outcome === undefined)) 
    {
       await noAnnex6ItsUnprohibited()
    }

    // finally, get the pests
    await getPests()

    logger.info('Annex6 (PROHIBITED) checks performed')

    async function prohibitionCheckAtCountryLevel() {
      logger.info('Level 1A: Starting Prohibited check at COUNTRY level')

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
          if (
            annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '')
          ) {
            logger.info(
              `Annex6 (PROHIBITED) rule is APPLICABLE at COUNTRY level, ${annex.A6_RULE}`
            )
            plantInfo.annexSixRule = annex.A6_RULE
            prohibitionConditionMet = true
            plantInfo.outcome = annex.OVERALL_DECISION
          }
        })
      }
      return plantInfo
    }

    async function prohibitionCheckAtRegionLevel() {
      logger.info('Level 1B: Starting Prohibition check at REGION level')
      let regionValue = ''
      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.COUNTRY_NAME.toLowerCase() !==
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '')
          ) {
            regionValue = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            annex6RegionType = regionValue.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            annex6RegionValue = regionValue.split(',')[1]

            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              if (
                reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                reg[1].toLowerCase() === annex6RegionValue.toLowerCase()
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule is APPLICABLE at REGION level, ${annex.A6_RULE}`
                )
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

    async function prohibitionCheckAllLevel() {
      logger.info('Level 1C: Starting Prohibition check at ALL level')
      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
          if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR === '' &&
              annex.DORMANT_INDICATOR === '' &&
              annex.SEED_INDICATOR === '' &&
              annex.FRUIT_INDICATOR === '' &&
              annex.BONSAI_INDICATOR === '' &&
              annex.INVINTRO_INDICATOR === '')
          ) {
            logger.info(
              `Annex6 (PROHIBITED) rule is APPLICABLE at ALL level, ${annex.A6_RULE}`
            )
            plantInfo.annexSixRule = annex.A6_RULE
            plantInfo.outcome = annex.OVERALL_DECISION
            prohibitionConditionMet = true
          }
        })
      }

      return plantInfo
    }

    async function setPlantAttributes(annex) {
      plantInfo.annexSixRule = annex.A6_RULE
      plantInfo.outcome = annex.OVERALL_DECISION
      plantInfo.ProhibitionClarification = annex.PROHIBITION_CLARIFICATION
      plantInfo.FormatClarification = annex.FORMAT_CLARIFICATION

      plantInfo.hybridIndicator = annex.HYBRID_INDICATOR
      plantInfo.dormantIndicator = annex.DORMANT_INDICATOR
      plantInfo.seedIndicator = annex.SEED_INDICATOR
      plantInfo.fruitIndicator = annex.FRUIT_INDICATOR
      plantInfo.bonsaiIndicator = annex.BONSAI_INDICATOR
      plantInfo.invintroIndicator = annex.INVINTRO_INDICATOR
    }

    async function partiallyProhibitionCheckAtCountryLevel() {
      logger.info(
        'Level 2A: Starting PARTIALLY PROHIBITED check at Country level'
      )

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            // check if atlease 1 exemption exists
            annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR !== '' ||
              annex.DORMANT_INDICATOR !== '' ||
              annex.SEED_INDICATOR !== '' ||
              annex.FRUIT_INDICATOR !== '' ||
              annex.BONSAI_INDICATOR !== '' ||
              annex.INVINTRO_INDICATOR !== '')
          ) {
            logger.info(
              'Level 2A: Partially Prohibited check applicable at COUNTRY level, SERVICE_FORMAT matched'
            )

            setPlantAttributes(annex)

            await getAnnex11Rules()
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info(
          'Level 2A: PARTIALLY PROHIBITED check APPLICABLE at Country level'
        )
      }

      return plantInfo
    }

    async function partiallyProhibitionCheckAtRegionLevel() {
      logger.info('Level 2B: Starting PARTIALLY PROHIBITED check at REGION level')
      let annex6Region = ''

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            // get Annex6 entries which has regions, match it with the region of the input country
            annex.COUNTRY_NAME.toLowerCase() !==
            innsProhibitedObj.country.toLowerCase() &&
            annex.COUNTRY_NAME.toLowerCase() !== 'all' &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR !== '' || annex.DORMANT_INDICATOR !== '' || annex.SEED_INDICATOR !== '' ||
              annex.FRUIT_INDICATOR !== '' || annex.BONSAI_INDICATOR !== '' || annex.INVINTRO_INDICATOR !== '')
          ) {
            annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            annex6RegionValue = annex6Region.split(',')[1]

            // get the region from countries collection
            const regionArr = await getCountryIndicators()
            regionArr.forEach(async function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              // check if region level entry exists for Annex 6
              if (
                reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                reg[1].toLowerCase() === annex6RegionValue.toLowerCase()
              ) {
                logger.info(
                  'Level 2B: Partially Prohibited check applicable at REGION level, SERVICE_FORMAT matched'
                )

                setPlantAttributes(annex)

                await getAnnex11Rules()

              }
            })
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info(
          'Level 2B: PARTIALLY PROHIBITED check APPLICABLE at REGION level'
        )
      }

      return plantInfo
    }

    async function partiallyProhibitionCheckAtAllLevel() {
      logger.info('Level 2C: Starting PARTIALLY PROHIBITED check at ALL level')

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR !== '' ||
              annex.DORMANT_INDICATOR !== '' ||
              annex.SEED_INDICATOR !== '' ||
              annex.FRUIT_INDICATOR !== '' ||
              annex.BONSAI_INDICATOR !== '' ||
              annex.INVINTRO_INDICATOR !== '')
          ) {
            logger.info(
              'Level 2C: Partially Prohibited check applicable at ALL level, SERVICE_FORMAT matched'
            )

            setPlantAttributes(annex)

            await getAnnex11Rules()
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info(
          'Level 2C: PARTIALLY PROHIBITED check APPLICABLE at ALL level'
        )
      }

      return plantInfo
    }

    async function getAnnex11For_HR_Country_SvcFmt_Species(annex11) {
      logger.info('Invoked : getAnnex11For_HR_Country_SvcFmt_Species')
      let annex11PlantRule = ''
      // Get annex11 rules for Hostref/Country/Service format/Species 

      if (innsProhibitedObj.hostRef.toString() === annex11.HOST_REF.toString()){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()) {
            logger.info(
              `Annex 11 rules found for Hostref/Country/Service format/Species , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
            )
            annex11PlantRule = annex11
        }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_HR_Region_SvcFmt_Species(annex11) {
      logger.info('Invoked : getAnnex11For_HR_Region_SvcFmt_Plant')

      let annex11PlantRule = ''
      let annex11Region = ''

      // Get annex11 rules for Hostref/Region/Service format/Species

      if (innsProhibitedObj.hostRef.toString() === annex11.HOST_REF.toString()){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( innsProhibitedObj.country.toLowerCase() !== annex11.COUNTRY_NAME.toLowerCase()
              && annex11.COUNTRY_NAME.toLowerCase() !== 'all') {

                // Get annex11 rules at Genus level for the matching service format
                annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                annex11RegionValue = annex11Region.split(',')[1]
                const regionArr = await getCountryIndicators()
                regionArr.forEach(function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0] === annex11RegionType.toLowerCase() &&
                    reg[1] === annex11RegionValue.toLowerCase()) {
                    logger.info(`Annex 11 rules found for Hostref/Region/Service format/Species , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
                    annex11PlantRule = annex11

                  }
                })
        }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_HR_All_SvcFmt_Family(annex11) {
      logger.info('Invoked : getAnnex11For_HR_All_SvcFmt_Family')
      let annex11PlantRule = ''
      // Get annex11 rules for Hostref/All/Service format/Family 

      if (innsProhibitedObj.hostRef.toString() === annex11.HOST_REF.toString()){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( annex11.COUNTRY_NAME.toLowerCase() === 'all') {
            logger.info(
              `Annex 11 rules found for Hostref/All/Service format/Family , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
            )
            annex11PlantRule = annex11
        }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_Country_SvcFmt_Genus(annex11) {
      logger.info('Invoked : getAnnex11For_Country_SvcFmt_Genus')
      let annex11PlantRule = ''
      // Get annex11 rules at Country/Service format/Genus 

      if (innsProhibitedObj.hostRef.toString() !== annex11.HOST_REF.toString() && annex11.HOST_REF.toString() !== "99999" ){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()) {
            logger.info(
              `Annex 11 rules found for Country/Service format/Genus , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
            )
            annex11PlantRule = annex11
        }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_Region_SvcFmt_Genus(annex11) {
      logger.info('Invoked : getAnnex11For_Region_SvcFmt_Genus')

      let annex11PlantRule = ''
      let annex11Region = ''

      // Get annex11 rules at Region/Service format/Genus 

      if (innsProhibitedObj.hostRef.toString() !== annex11.HOST_REF.toString() && annex11.HOST_REF.toString() !== "99999"){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( innsProhibitedObj.country.toLowerCase() !== annex11.COUNTRY_NAME.toLowerCase()
              && innsProhibitedObj.country.toLowerCase() !== 'all') {

                annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                annex11RegionValue = annex11Region.split(',')[1]
                const regionArr = await getCountryIndicators()
                regionArr.forEach(function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0] === annex11RegionType.toLowerCase() &&
                    reg[1] === annex11RegionValue.toLowerCase()) {
                    logger.info(`Annex 11 rules found for Region/Service format/Genus , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
                    annex11PlantRule = annex11

                  }
                })
        }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_All_SvcFmt_Genus(annex11) {
      logger.info('Invoked : getAnnex11For_All_SvcFmt_Genus')

      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format/Genus 
      if (innsProhibitedObj.hostRef.toString() !== annex11.HOST_REF.toString() && annex11.HOST_REF.toString() !== "99999"){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {

              logger.info(`Annex 11 rules found for All/Service format/Genus , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
            annex11PlantRule = annex11
          }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_All_SvcFmt_Country(annex11) {
      logger.info('Invoked : getAnnex11For_All_SvcFmt_Country')
      let annex11PlantRule = ''
      // Get annex11 rules at All/Service format/Country 

      if (annex11.HOST_REF.toString() === "99999" ){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase()) {
            logger.info(
              `Annex 11 rules found for All/Service format/Country , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
            )
            annex11PlantRule = annex11
        }
      }
    }
      return annex11PlantRule
    }

    async function getAnnex11For_All_SvcFmt_Region(annex11) {
      logger.info('Invoked : getAnnex11For_Region_SvcFmt_Genus')

      let annex11PlantRule = ''
      let annex11Region = ''

      // Get annex11 rules at All/Service format/Region 

      if (annex11.HOST_REF.toString() === "99999"){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if ( innsProhibitedObj.country.toLowerCase() !== annex11.COUNTRY_NAME.toLowerCase()
              && innsProhibitedObj.country.toLowerCase() !== 'all') {

                annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g, '')
                annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
                annex11RegionValue = annex11Region.split(',')[1]
                const regionArr = await getCountryIndicators()
                regionArr.forEach(function (reg) {
                  if (reg[0] === 'EUSL_INDICATOR')
                    plantInfo.isEUSL = reg[1].toLowerCase()

                  if (
                    reg[0] === annex11RegionType.toLowerCase() &&
                    reg[1] === annex11RegionValue.toLowerCase()) {
                    logger.info(`Annex 11 rules found for All/Service format/Region , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
                    annex11PlantRule = annex11

                  }
                })
        }
      }
     
    }

      return annex11PlantRule
    }

    async function getAnnex11For_All_SvcFmt(annex11) {
      logger.info('Invoked : getAnnex11For_All_SvcFmt')

      let annex11PlantRule = ''

      // Get annex11 rules at All/Service format 

      if (annex11.HOST_REF.toString() === "99999"){
        if ( annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase()){
          if (annex11.COUNTRY_NAME.toLowerCase() === 'all') {

              logger.info(`Annex 11 rules found for All/Service format  , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
            annex11PlantRule = annex11

          }
      }
    }
      return annex11PlantRule
    }

    // async function getAnnex11Rules() {
    //   let annex11CountrySpecies = ''
    //   let annex11RegionSpecies = ''
    //   let annex11AllSpecies = ''
    //   let annex11CountrySpeciesArr = []
    //   let annex11RegionSpeciesArr = []
    //   let annex11AllSpeciesArr = []

    //   let annex11CountryGenus = ''
    //   let annex11RegionGenus = ''
    //   let annex11AllGenus = ''
    //   let annex11CountryGenusArr = []
    //   let annex11RegionGenusArr = []
    //   let annex11AllGenusArr = []

    //   let annex11CountryFamily = ''
    //   let annex11RegionFamily = ''
    //   let annex11AllFamily = ''
    //   let annex11CountryFamilyArr = []
    //   let annex11RegionFamilyArr = []
    //   let annex11AllFamilyArr = []

    //   let a11RulesFetchedForCountry = false

    //   if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)) {
    //     plantDocument.HOST_REGULATION.ANNEX11.forEach(async (annex11) => {

    //       // SPECIES
    //       annex11CountrySpecies = await getAnnex11For_HR_Country_SvcFmt_Species(annex11)
    //       if (typeof annex11CountrySpecies === 'object' && annex11CountrySpecies !== null) {
    //         annex11CountrySpeciesArr.push(annex11CountrySpecies)
    //       }

    //       annex11RegionSpecies = await getAnnex11For_HR_Region_SvcFmt_Species(annex11)
    //       if (typeof annex11RegionSpecies === 'object' && annex11RegionSpecies !== null) {
    //         annex11RegionSpeciesArr.push(annex11RegionSpecies)
    //       }

    //       annex11AllSpecies = await getAnnex11For_HR_All_SvcFmt_Family(annex11)
    //       if (typeof annex11AllSpecies === 'object' && annex11AllSpecies !== null) {
    //         annex11AllSpeciesArr.push(annex11AllSpecies)
    //       }

    //       // GENUS
    //       annex11CountryGenus = await getAnnex11For_Country_SvcFmt_Genus(annex11)
    //       if (typeof annex11CountryGenus === 'object' && annex11CountryGenus !== null) {
    //         annex11CountryGenusArr.push(annex11CountryGenus)
    //       }

    //       annex11RegionGenus = await getAnnex11For_Region_SvcFmt_Genus(annex11)
    //       if (typeof annex11RegionGenus === 'object' && annex11RegionGenus !== null) {
    //         annex11RegionGenusArr.push(annex11RegionGenus)
    //       }

    //       annex11AllGenus = await getAnnex11For_All_SvcFmt_Genus(annex11)
    //       if (typeof annex11AllGenus === 'object' && annex11AllGenus !== null) {
    //         annex11AllGenusArr.push(annex11AllGenus)
    //       }
         
    //       // ALL
    //       annex11CountryFamily = await getAnnex11For_All_SvcFmt_Country(annex11)
    //       if (typeof annex11CountryFamily === 'object' && annex11CountryFamily !== null) {
    //         annex11CountryFamilyArr.push(annex11CountryFamily)
    //       }

    //       annex11RegionFamily = await getAnnex11For_All_SvcFmt_Region(annex11)
    //       if (typeof annex11RegionFamily === 'object' && annex11RegionFamily !== null) {
    //         annex11RegionFamilyArr.push(annex11RegionFamily)
    //       }

    //       annex11AllFamily = await getAnnex11For_All_SvcFmt(annex11)
    //       if (typeof annex11AllFamily === 'object' && annex11AllFamily !== null) {
    //         console.log('got annex11AllFamily and pushing to array')
    //         annex11AllFamilyArr.push(annex11AllFamily)
    //       }
    //     })
    //   }

    //   // SPECIES ARRAY
    //   if (a11RulesFetchedForCountry === false && Array.isArray (annex11CountrySpeciesArr) && annex11CountrySpeciesArr.length > 0 ) {
    //     logger.info('annex11CountrySpeciesArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11CountrySpeciesArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11RegionSpeciesArr) && annex11RegionSpeciesArr.length > 0) {
    //     logger.info('annex11RegionSpeciesArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11RegionSpeciesArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   console.log('found rules annex11AllSpeciesArr')
    //   console.log(annex11AllSpeciesArr)
    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11AllSpeciesArr) && annex11AllSpeciesArr.length > 0) {
    //     logger.info('annex11AllSpeciesArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11AllSpeciesArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   // GENUS ARRAY
    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11CountryGenusArr) && annex11CountryGenusArr.length > 0 ) {
    //     logger.info('annex11CountryGenusArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11CountryGenusArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11RegionGenusArr) && annex11RegionGenusArr.length > 0) {
    //     logger.info('annex11RegionGenusArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11RegionGenusArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11AllGenusArr) && annex11AllGenusArr.length > 0) {
    //     logger.info('annex11AllGenusArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11AllGenusArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   // ALL ARRAY
    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11CountryFamilyArr) && annex11CountryFamilyArr.length > 0) {
    //     logger.info('annex11CountryFamilyArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11CountryFamilyArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11RegionFamilyArr) && annex11RegionFamilyArr.length > 0) {
    //     logger.info('annex11RegionFamilyArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11RegionFamilyArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   console.log('found rules annex11AllFamilyArr')
    //   console.log(annex11AllFamilyArr)
    //   if (a11RulesFetchedForCountry === false && Array.isArray(annex11AllFamilyArr) && annex11AllFamilyArr.length > 0) {
    //     logger.info('annex11AllFamilyArr.length > 0')
    //     plantInfo.annex11RulesArr = annex11AllFamilyArr
    //     a11RulesFetchedForCountry = true
    //   }

    //   console.log('rules fetched')
    //   console.log(a11RulesFetchedForCountry)

    //   return plantInfo
    // }

    async function getAnnex11Rules() {
      let annex11CountrySpecies = '';
      let annex11RegionSpecies = '';
      let annex11AllSpecies = '';
      let annex11CountrySpeciesArr = [];
      let annex11RegionSpeciesArr = [];
      let annex11AllSpeciesArr = [];
  
      let annex11CountryGenus = '';
      let annex11RegionGenus = '';
      let annex11AllGenus = '';
      let annex11CountryGenusArr = [];
      let annex11RegionGenusArr = [];
      let annex11AllGenusArr = [];
  
      let annex11CountryFamily = '';
      let annex11RegionFamily = '';
      let annex11AllFamily = '';
      let annex11CountryFamilyArr = [];
      let annex11RegionFamilyArr = [];
      let annex11AllFamilyArr = [];
  
      let a11RulesFetchedForCountry = false;
  
      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)) {
          for (const annex11 of plantDocument.HOST_REGULATION.ANNEX11) {
              // SPECIES
              annex11CountrySpecies = await getAnnex11For_HR_Country_SvcFmt_Species(annex11);
              if (typeof annex11CountrySpecies === 'object' && annex11CountrySpecies !== null) {
                  annex11CountrySpeciesArr.push(annex11CountrySpecies);
              }
  
              annex11RegionSpecies = await getAnnex11For_HR_Region_SvcFmt_Species(annex11);
              if (typeof annex11RegionSpecies === 'object' && annex11RegionSpecies !== null) {
                  annex11RegionSpeciesArr.push(annex11RegionSpecies);
              }
  
              annex11AllSpecies = await getAnnex11For_HR_All_SvcFmt_Family(annex11);
              if (typeof annex11AllSpecies === 'object' && annex11AllSpecies !== null) {
                  annex11AllSpeciesArr.push(annex11AllSpecies);
              }
  
              // GENUS
              annex11CountryGenus = await getAnnex11For_Country_SvcFmt_Genus(annex11);
              if (typeof annex11CountryGenus === 'object' && annex11CountryGenus !== null) {
                  annex11CountryGenusArr.push(annex11CountryGenus);
              }
  
              annex11RegionGenus = await getAnnex11For_Region_SvcFmt_Genus(annex11);
              if (typeof annex11RegionGenus === 'object' && annex11RegionGenus !== null) {
                  annex11RegionGenusArr.push(annex11RegionGenus);
              }
  
              annex11AllGenus = await getAnnex11For_All_SvcFmt_Genus(annex11);
              if (typeof annex11AllGenus === 'object' && annex11AllGenus !== null) {
                  annex11AllGenusArr.push(annex11AllGenus);
              }
  
              // ALL
              annex11CountryFamily = await getAnnex11For_All_SvcFmt_Country(annex11);
              if (typeof annex11CountryFamily === 'object' && annex11CountryFamily !== null) {
                  annex11CountryFamilyArr.push(annex11CountryFamily);
              }
  
              annex11RegionFamily = await getAnnex11For_All_SvcFmt_Region(annex11);
              if (typeof annex11RegionFamily === 'object' && annex11RegionFamily !== null) {
                  annex11RegionFamilyArr.push(annex11RegionFamily);
              }
  
              annex11AllFamily = await getAnnex11For_All_SvcFmt(annex11);
              if (typeof annex11AllFamily === 'object' && annex11AllFamily !== null) {
                  console.log('got annex11AllFamily and pushing to array');
                  annex11AllFamilyArr.push(annex11AllFamily);
              }
          }
      }
  
      // SPECIES ARRAY
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11CountrySpeciesArr) && annex11CountrySpeciesArr.length > 0) {
          logger.info('annex11CountrySpeciesArr.length > 0');
          plantInfo.annex11RulesArr = annex11CountrySpeciesArr;
          a11RulesFetchedForCountry = true;
      }
  
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11RegionSpeciesArr) && annex11RegionSpeciesArr.length > 0) {
          logger.info('annex11RegionSpeciesArr.length > 0');
          plantInfo.annex11RulesArr = annex11RegionSpeciesArr;
          a11RulesFetchedForCountry = true;
      }
  
      console.log('found rules annex11AllSpeciesArr');
      console.log(annex11AllSpeciesArr.length > 0);
      console.log(a11RulesFetchedForCountry)
      console.log(Array.isArray(annex11AllSpeciesArr))
      if (a11RulesFetchedForCountry === false && annex11AllSpeciesArr.length > 0) {
          logger.info('annex11AllSpeciesArr.length > 0');
          plantInfo.annex11RulesArr = annex11AllSpeciesArr;
          a11RulesFetchedForCountry = true;
      }
  
      // GENUS ARRAY
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11CountryGenusArr) && annex11CountryGenusArr.length > 0) {
          logger.info('annex11CountryGenusArr.length > 0');
          plantInfo.annex11RulesArr = annex11CountryGenusArr;
          a11RulesFetchedForCountry = true;
      }
  
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11RegionGenusArr) && annex11RegionGenusArr.length > 0) {
          logger.info('annex11RegionGenusArr.length > 0');
          plantInfo.annex11RulesArr = annex11RegionGenusArr;
          a11RulesFetchedForCountry = true;
      }
  
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11AllGenusArr) && annex11AllGenusArr.length > 0) {
          logger.info('annex11AllGenusArr.length > 0');
          plantInfo.annex11RulesArr = annex11AllGenusArr;
          a11RulesFetchedForCountry = true;
      }
  
      // ALL ARRAY
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11CountryFamilyArr) && annex11CountryFamilyArr.length > 0) {
          logger.info('annex11CountryFamilyArr.length > 0');
          plantInfo.annex11RulesArr = annex11CountryFamilyArr;
          a11RulesFetchedForCountry = true;
      }
  
      if (a11RulesFetchedForCountry === false && Array.isArray(annex11RegionFamilyArr) && annex11RegionFamilyArr.length > 0) {
          logger.info('annex11RegionFamilyArr.length > 0');
          plantInfo.annex11RulesArr = annex11RegionFamilyArr;
          a11RulesFetchedForCountry = true;
      }
  
      console.log('found rules annex11AllFamilyArr');
      console.log(annex11AllFamilyArr.length > 0);
      console.log(a11RulesFetchedForCountry)
      console.log(Array.isArray(annex11AllFamilyArr))
      if (a11RulesFetchedForCountry === false  && annex11AllFamilyArr.length > 0) {
          logger.info('annex11AllFamilyArr.length > 0');
          plantInfo.annex11RulesArr = annex11AllFamilyArr;
          a11RulesFetchedForCountry = true;
      }
  
      console.log('rules fetched');
      console.log(a11RulesFetchedForCountry);
      console.log(plantInfo.annex11RulesArr)
     // return plantInfo;
  }
  
    async function getCountryIndicators() {
      const region = innsProhibitedObj.countryDetails.REGION
      // logger.info('Country Region is:' + region)
      const rawRegionArray = region.split(';')
      let regionIndicator = ''
      const formatedRegionArr = []
      // logger.info('Raw Region is:' + rawRegionArray)
      rawRegionArray.forEach(function (reg) {
        regionIndicator = reg.replace(/[()\s-]+/g, '') // replace brackets in region indicator with empty string
        formatedRegionArr.push(regionIndicator.split(','))
      })

      // logger.info('Formatted Region is:' + formatedRegionArr)
      return formatedRegionArr
    }

    async function getUnprohibitedAnnex11RulesAtCountryLevel() {
      logger.info('Level 3A: Starting UN-PROHIBITED checks at COUNTRY level')
      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          if (
            annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited') {

            setPlantAttributes(annex)

            // Fetch applicable Annex11 Rules at country level
            await getAnnex11Rules()
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info('Level 3A: UN-PROHIBITED check APPLICABLE at Country level')
      }
    }

    async function getUnprohibitedAnnex11RulesAtRegionLevel() {
      logger.info('Level 3B: Starting UN-PROHIBITED checks at REGION level')
      let annex6Region = ''

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async (annex) => {
          logger.info(
            `Step 3B (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`
          )

          if (
            annex.COUNTRY_NAME.toLowerCase() !==
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited') {
            annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            annex6RegionValue = annex6Region.split(',')[1]

            // get the region from countries collection
            const regionArr = await getCountryIndicators()
            regionArr.forEach(async function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              //logger.info(`formatted region is : ${reg[0]}, ${reg[1]}`)

              // check if region level entry exists for Annex 6
              if (
                reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                reg[1].toLowerCase() === annex6RegionValue.toLowerCase()
              ) {
                setPlantAttributes(annex)

                // Get Annex11 rules at for the matched 'Region'
                await getAnnex11Rules()
              }
            })
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info('Level 3B: UN-PROHIBITED check APPLICABLE at REGION level')
      }

      return plantInfo
    }

    async function getUnprohibitedAnnex11RulesAtAllLevel() {
      logger.info('Level 3C: Starting UN-PROHIBITED check at ALL level')

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
        plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
          logger.info(
            `Step 3C (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`
          )

          if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited') {

            setPlantAttributes(annex)

            // Check for Annex11 rules at 'All' Level
            plantDocument.HOST_REGULATION.ANNEX11.forEach((annex11) => {
              if (
                annex11.COUNTRY_NAME.toLowerCase() === 'all' &&
                annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
                annex11.HOST_REF.toString() === "99999") {
                logger.info(`Annex 11 rules found for , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
                plantInfo.annex11RulesArr.push(annex11)
              }
            })
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info('Level 3C: UN-PROHIBITED check APPLICABLE at All level')
      }

      return plantInfo
    }

    async function noAnnex6ItsUnprohibited() {
      logger.info(
        'Level 4A: Starting UN-PROHIBITED check for Region/All with NO Annex6 entries'
      )

      // Get Annex11 rules at for the matched 'Region'
      await getAnnex11Rules()

      if (plantInfo.annex11RulesArr.length > 0 && !(plantInfo.outcome)) {
        plantInfo.outcome = 'not prohibited'
        prohibitionConditionMet = true
        logger.info(
          'Level 4: UN-PROHIBITED check APPLICABLE for Region with NO Annex6 Entries'
        )
      }

      return plantInfo
    }

    async function getPests() {
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
      return plantInfo
    }

    return plantInfo

  }
}

export { ProhibitedStrategy }
