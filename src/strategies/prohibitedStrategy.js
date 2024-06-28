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
    await prohibitionCheckAtCountryLevel()
    if (prohibitionConditionMet === false) await prohibitionCheckAtRegionLevel()
    if (prohibitionConditionMet === false) await prohibitionCheckAllLevel()

    // move to partially-prohibited checks
    if (prohibitionConditionMet === false)
      await partiallyProhibitionCheckAtCountryLevel()
    if (prohibitionConditionMet === false)
      await partiallyProhibitionCheckAtRegionLevel()
    if (prohibitionConditionMet === false)
      await partiallyProhibitionCheckAtAllLevel()

    // move to un-prohibited checks
    if (prohibitionConditionMet === false)
      await getUnprohibitedAnnex11RulesAtCountryLevel()
    if (prohibitionConditionMet === false)
      await getUnprohibitedAnnex11RulesAtRegionLevel()
    if (prohibitionConditionMet === false)
      await getUnprohibitedAnnex11RulesAtAllLevel()

    if (prohibitionConditionMet === false) await noAnnex6ItsUnprohibitedForRegion()
    if (prohibitionConditionMet === false) 
      await noAnnex6ItsUnprohibitedGlobally()

    // finall, get the pests
    await getPests()

    logger.info('Annex6 (PROHIBITED) checks performed')

    return plantInfo

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
           ( annex.HYBRID_INDICATOR === '' &&
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

    async function setPlantAttributes() {
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
        plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
          if (
            // check if atlease 1 exemption exists
            annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            (annex.HYBRID_INDICATOR  !== '' ||
              annex.DORMANT_INDICATOR  !== ''  ||
              annex.SEED_INDICATOR  !== '' ||
              annex.FRUIT_INDICATOR  !== '' ||
              annex.BONSAI_INDICATOR  !== '' ||
              annex.INVINTRO_INDICATOR  !== '' )
          ) {
            logger.info(
              'Level 2A: Partially Prohibited check applicable at COUNTRY level, SERVICE_FORMAT matched'
            )

            setPlantAttributes(annex)

            // Fetch applicable Annex11 Rules at country level
            getAnnex11Rules()
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
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async function (annex) {
          if (
              // get rules for the region of the input country
              annex.COUNTRY_NAME.toLowerCase() !==
              innsProhibitedObj.country.toLowerCase() &&
              annex.COUNTRY_NAME.toLowerCase() !== 'all' &&
              annex.SERVICE_FORMAT.toLowerCase() ===
              innsProhibitedObj.serviceFormat.toLowerCase() &&
              (annex.HYBRID_INDICATOR !== ''  || annex.DORMANT_INDICATOR !== '' || annex.SEED_INDICATOR !== ''  ||
                annex.FRUIT_INDICATOR !== ''  || annex.BONSAI_INDICATOR !== '' || annex.INVINTRO_INDICATOR !== '')
          ) {
              annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
              annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
              annex6RegionValue = annex6Region.split(',')[1]

              // get the region from countries collection
              const regionArr = await getCountryIndicators()
              regionArr.forEach(function (reg) {
                if (reg[0] === 'EUSL_INDICATOR')
                  plantInfo.isEUSL = reg[1].toLowerCase()

                logger.info(`formatted region is : ${reg[0]}, ${reg[1]}`)
                logger.info(annex)

                // check if region level entry exists for Annex 6
                if (
                  reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                  reg[1].toLowerCase() === annex6RegionValue.toLowerCase()
                ) {
                  logger.info(
                    'Level 2B: Partially Prohibited check applicable at REGION level, SERVICE_FORMAT matched'
                  )

                  setPlantAttributes(annex)

                  // Get Annex11 rules at for the matched 'Region'
                  getAnnex11ForSvcFmtPlantGenus()

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
        plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
          if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            ( annex.HYBRID_INDICATOR !== '' ||
              annex.DORMANT_INDICATOR !== '' ||
              annex.SEED_INDICATOR !== '' ||
              annex.FRUIT_INDICATOR !== '' ||
              annex.BONSAI_INDICATOR !== '' ||
              annex.INVINTRO_INDICATOR !== '' )
          ) {
            logger.info(
              'Level 2C: Partially Prohibited check applicable at ALL level, SERVICE_FORMAT matched'
            )

            setPlantAttributes()

            // Check for Annex11 rules at 'All' Level
            plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
              if (
                annex11.COUNTRY_NAME.toLowerCase() === 'all' && 
                annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
                annex11.HOST_REF === 99999
              ) {
                logger.info(`Annex 11 rules found for , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
                plantInfo.annex11RulesArr.push(annex11)
                logger.info('Level 2C: Annex 11 region match')
              }
            })
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

    async function getAnnex11ForHRefSvcFmtPlantSpecies(annex11)
    {
        let annex11PlantArr = ''
        // Get annex11 rules at hostref (species) level for the matching service format
        if (
          innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase() &&
          annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
          innsProhibitedObj.hostRef === annex11.HOST_REF
        ) {
          logger.info(
            `Annex 11 rules found for Plant , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
          )

          annex11PlantArr = annex11
          //plantInfo.annex11RulesArr.push(annex11)
          logger.info('Level 2A: Annex 11 region match')
        }

        return annex11PlantArr
    }

    async function getAnnex11ForHRefSvcFmtPlantGenus(annex11)
    {
        let annex11GenusArr = []
        // Get annex11 rules at hostref (Genus) level for the matching service format
        if (
          innsProhibitedObj.country.toLowerCase() === annex11.COUNTRY_NAME.toLowerCase() &&
          annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
          innsProhibitedObj.hostRef !== annex11.HOST_REF && annex11.HOST_REF !== 99999
        ) {
          logger.info(
            `Annex 11 rules found for Genus, ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
          )

          annex11GenusArr.push(annex11)
          //plantInfo.annex11RulesArr.push(annex11)
          logger.info('Level 2A: Annex 11 region match')
        }

        return annex11GenusArr
    }
    
    async function getAnnex11ForSvcFmtPlantGenus()
    {
      let annex11Region = ''
      let annex11GenusArr = []
      let annex11FamilyArr = []
      let annex11RulesFetched = false
      
      plantDocument.HOST_REGULATION.ANNEX11.forEach(
        function (annex11) {
          annex11Region = annex11.COUNTRY_NAME.replace(/[()\s-]+/g,'')
          annex11RegionType = annex11Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
          annex11RegionValue = annex11Region.split(',')[1]
          
          // Get annex11 rules at Genus level for the matching service format
          if (
            reg[0].toLowerCase() === annex11RegionType.toLowerCase() &&
            reg[1].toLowerCase() === annex11RegionValue.toLowerCase() &&
            annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            innsProhibitedObj.hostRef !== annex11.hostRef && annex11.hostRef !== 99999 ) {
            logger.info( `Annex 11 rules found for Plant , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)
            //plantInfo.annex11RulesArr.push(annex11)
            logger.info('Level 2B: Annex 11 region match')
            annex11GenusArr.push(annex11)

          }

          // Get annex11 rules at Family level for the matching service format
          if ( 
            reg[0].toLowerCase() === annex11RegionType.toLowerCase() &&
            reg[1].toLowerCase() === annex11RegionValue.toLowerCase() &&
            annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
            innsProhibitedObj.hostRef !== annex11.hostRef && annex11.hostRef === 99999 ) {
            logger.info( `Annex 11 rules found for Family , ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`)

            annex11FamilyArr.push(annex11)
            //plantInfo.annex11RulesArr.push(annex11)
            logger.info('Level 2A: Annex 11 region match')
          }
        }
      )
      
      if (annex11RulesFetched === false && annex11GenusArr.length > 0) {
        plantInfo.annex11RulesArr = annex11GenusArr
        annex11RulesFetched = true
      }

      if (annex11RulesFetched === false && annex11FamilyArr.length > 0) {
        plantInfo.annex11RulesArr = annex11FamilyArr
        annex11RulesFetched = true
      }

    }

    async function getAnnex11ForHRefSvcFmtPlantFamily(annex11)
    {
        let annex11FamilyArr = []
        // Get annex11 rules at hostref (Family) level for the matching service format
        if (
          innsProhibitedObj.country.toLowerCase() ===
          annex11.COUNTRY_NAME.toLowerCase() &&
          annex11.SERVICE_FORMAT.toLowerCase() ===
          innsProhibitedObj.serviceFormat.toLowerCase() &&
          innsProhibitedObj.hostRef !== annex11.HOST_REF && annex11.HOST_REF === 99999
        ) {
          logger.info(
            `Annex 11 rules found for Family, ${annex11.HOST_REF}, ${annex11.COUNTRY_NAME}`
          )

          annex11FamilyArr.push(annex11)
          //plantInfo.annex11RulesArr.push(annex11)
          logger.info('Level 2A: Annex 11 region match')
        }

        return annex11FamilyArr
    }

    async function getAnnex11Rules() {
      let annex11Plant = ''
      let annex11Genus = ''
      let annex11Family = ''
      let annex11PlantArr = []
      let annex11GenusArr = []
      let annex11FamilyArr = []
      let annex11RulesFetched = false

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)) {
        plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {

          // Get annex11 rules at hostref (species) level for the matching service format
          annex11Plant = getAnnex11ForHRefSvcFmtPlantSpecies(annex11)
          if (annex11Plant !== '')
          annex11PlantArr.push(annex11Plant)

          // Get annex11 rules at Genus level for the matching service format
          annex11Genus = getAnnex11ForHRefSvcFmtPlantGenus(annex11)
          if (annex11Genus !== '')
          annex11GenusArr.push(annex11Genus)

          // Get annex11 rules at Family level for the matching service format
          annex11Family = getAnnex11ForHRefSvcFmtPlantFamily(annex11)
          if (annex11Genus !== '')
          annex11FamilyArr.push(annex11Family)

        })
      }

      if (annex11PlantArr.length > 0) {
        plantInfo.annex11RulesArr = annex11PlantArr
        annex11RulesFetched = true
      }

      if (annex11RulesFetched === false && annex11GenusArr.length > 0) {
        plantInfo.annex11RulesArr = annex11GenusArr
        annex11RulesFetched = true
      }

      if (annex11RulesFetched === false && annex11FamilyArr.length > 0) {
        plantInfo.annex11RulesArr = annex11FamilyArr
        annex11RulesFetched = true
      }

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
        plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
          if (
            annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' ) {
            
            setPlantAttributes()

            // Fetch applicable Annex11 Rules at country level
            getAnnex11Rules()
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
        plantDocument.HOST_REGULATION.ANNEX6.forEach(async function (annex) {
          logger.info(
            `Step 3B (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`
          )

          if (
            annex.COUNTRY_NAME.toLowerCase() !==
            innsProhibitedObj.country.toLowerCase() &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited'  ) {
            annex6Region = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
            annex6RegionType = annex6Region.split(',')[0] // Example in Mongo: COUNTRY_NAME:"EUROPE_INDICATOR, FALSE"
            annex6RegionValue = annex6Region.split(',')[1]

            // get the region from countries collection
            const regionArr = await getCountryIndicators()
            regionArr.forEach(function (reg) {
              if (reg[0] === 'EUSL_INDICATOR')
                plantInfo.isEUSL = reg[1].toLowerCase()

              logger.info(`formatted region is : ${reg[0]}, ${reg[1]}`)

              // check if region level entry exists for Annex 6
              if (
                reg[0].toLowerCase() === annex6RegionType.toLowerCase() &&
                reg[1].toLowerCase() === annex6RegionValue.toLowerCase()
              ) {
                setPlantAttributes()

                // Get Annex11 rules at for the matched 'Region'
                getAnnex11ForSvcFmtPlantGenus()              
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
        plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
          logger.info(
            `Step 3C (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`
          )

          if (
            annex.COUNTRY_NAME.toLowerCase() === 'all' &&
            annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex.OVERALL_DECISION.toLowerCase() === 'not prohibited' ) {

            setPlantAttributes()

            // Check for Annex11 rules at 'All' Level
            plantDocument.HOST_REGULATION.ANNEX11.forEach(function (annex11) {
              if (
                annex11.COUNTRY_NAME.toLowerCase() === 'all' &&
                annex11.SERVICE_FORMAT.toLowerCase() === innsProhibitedObj.serviceFormat.toLowerCase() &&
                annex11.HOST_REF === 99999 ) {
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

    async function noAnnex6ItsUnprohibitedForRegion() {
      logger.info(
        'Level 4A: Starting UN-PROHIBITED check for Region with NO Annex6 entries'
      )

      // Get Annex11 rules at for the matched 'Region'
      getAnnex11ForSvcFmtPlantGenus()   

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info(
          'Level 4: UN-PROHIBITED check APPLICABLE for Region with NO Annex6 Entries'
        )
      }

      return plantInfo
    }

    async function noAnnex6ItsUnprohibitedGlobally() {
      logger.info(
        'Level 4B: Starting UN-PROHIBITED check for Global with NO Annex6 entries'
      )

      if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX11)) {
        plantDocument.HOST_REGULATION.ANNEX11.forEach(async function (annex11) {
          // get the region from countries collection
          const regionArr = await getCountryIndicators()

          regionArr.forEach(function (reg) {
            if (reg[0] === 'EUSL_INDICATOR') {
              plantInfo.isEUSL = reg[1].toLowerCase()
            }
          })

          if (
            annex11.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
            annex11.COUNTRY_NAME.toLowerCase() === 'all' && annex11.HOST_REF !== 99999
          ) {
            logger.info('Level 4B: Annex 11 region match')
            plantInfo.annex11RulesArr.push(annex11)
            plantInfo.outcome = 'not prohibited'
          }
        })
      }

      if (plantInfo.annex11RulesArr.length > 0) {
        prohibitionConditionMet = true
        logger.info(
          'Level 4B: UN-PROHIBITED check APPLICABLE for Global with NO Annex6 Entries'
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
  }
}

export { ProhibitedStrategy }
