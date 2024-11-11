import convict from 'convict'

const pestDocumentsMongoSchema = convict({
  CSL_REF: {
    doc: 'Reference ID for the pest',
    format: 'int',
    default: null
  },
  EPPO_CODE: {
    doc: 'EPPO code for the pest',
    format: String,
    default: ''
  },
  LATIN_NAME: {
    doc: 'Latin name of the pest',
    format: String,
    default: ''
  },
  DOCUMENT_TITLE: {
    doc: 'Title of the document',
    format: String,
    default: ''
  },
  DOCUMENT_TYPE: {
    doc: 'Type of the document',
    format: '*',
    default: ''
  },
  VISIBLE_ON_PHI_INDICATOR: {
    doc: 'Indicator if visible on PHI Portal',
    format: '*',
    default: 0
  },
  DOCUMENT_HYPER_LINK: {
    doc: 'Hyperlink to the document',
    format: String,
    default: ''
  },
  PUBLICATION_DATE: {
    doc: 'Publication date of the document',
    format: String,
    default: ''
  },
  DOCUMENT_SIZE: {
    doc: 'Size of the document',
    format: '*',
    default: null
  },
  DOCUMENT_FORMAT: {
    doc: 'Format of the document',
    format: String,
    default: ''
  }
})

export default pestDocumentsMongoSchema
