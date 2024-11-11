import convict from 'convict'

const plantPestLinkMongoSchema = convict({
  HOST_REF: {
    doc: 'Reference ID for the host',
    format: 'int',
    default: null
  },
  CSL_REF: {
    doc: 'Reference ID for the pest',
    format: 'int',
    default: null
  }
})

export default plantPestLinkMongoSchema
