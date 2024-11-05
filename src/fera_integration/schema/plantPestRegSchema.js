import convict from 'convict'
 
const pestRegulationMongoSchema = convict({
  CSL_REF: {
    doc: "Reference ID for the pest",
    format: Number,
    default: null
  },
  HOST_REF: {
    doc: "Host reference ID",
    format: '*',
    default: null
  },
  HOST_NAME: {
    doc: "Host name",
    format: String,
    default: ''
  },
  HOST_FORMAT_ID: {
    doc: "Host format ID",
    format: '*',
    default: null
  },
  HOST_FORMAT: {
    doc: "Host format name",
    format: String,
    default: ''
  },
  REGULATION: {
    doc: "Regulation name",
    format: String,
    default: ''
  },
  REGULATION_CATEGORY: {
    doc: "Regulation category",
    format: String,
    default: ''
  },
  QUARANTINE_INDICATOR: {
    doc: "Indicator for quarantine",
    format: String,
    default: ''
  },
  REGULATION_INDICATOR: {
    doc: "Regulation indicator",
    format: String,
    default: ''
  }
})
 
export default pestRegulationMongoSchema