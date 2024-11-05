import convict from 'convict'
 
const pestDistributionMongoSchema = convict({
  CSL_REF: {
    doc: "Reference ID for the pest",
    format: 'int',
    default: null
  },
  COUNTRY_CODE: {
    doc: "ISO country code",
    format: String,
    default: ''
  },
  COUNTRY_NAME: {
    doc: "Name of the country",
    format: String,
    default: ''
  },
  STATUS: {
    doc: "Presence status of the pest",
    format: String,
    default: ''
  }
})
 
export default pestDistributionMongoSchema