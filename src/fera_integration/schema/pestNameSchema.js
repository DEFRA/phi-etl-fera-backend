import convict from 'convict'

const pestMongoSchema = convict({
  CSL_REF: {
    doc: 'Reference ID for the pest',
    format: 'int',
    default: null
  },
  EPPO_CODE: {
    doc: 'EPPO code for the pest',
    format: '*',
    default: ''
  },
  LATIN_NAME: {
    doc: 'Latin name of the pest',
    format: String,
    default: ''
  },
  COMMON_NAME: {
    doc: 'Common name object containing IDs and names',
    format: Object,
    default: {
      COMMON_NAME_ID: [],
      COMMON_NAME: []
    }
  },
  SYNONYM_NAME: {
    doc: 'Synonym name object containing IDs and names',
    format: Object,
    default: {
      SYNONYM_NAME_ID: [],
      SYNONYM_NAME: []
    }
  }
})

export default pestMongoSchema
