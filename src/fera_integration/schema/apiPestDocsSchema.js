import convict from 'convict'

const pestDocumentsApiSchema = convict({
  PestRef: {
    doc: 'Reference ID for the pest',
    format: 'int',
    default: null
  },
  ArrayDocumentation: {
    doc: 'Array of documents',
    format: Array,
    default: [],
    children: {
      DocumentDescription: {
        doc: 'Description of the document',
        format: String,
        default: ''
      },
      DocumentTitle: {
        doc: 'Title of the document',
        format: String,
        default: ''
      },
      DocumentType: {
        doc: 'Type of the document',
        format: String,
        default: ''
      },
      VisibleOnPHPortal: {
        doc: 'Indicator if visible on PH Portal',
        format: 'int',
        default: 0
      },
      DocumentHyperlink: {
        doc: 'Hyperlink to the document',
        format: String,
        default: ''
      },
      PublicationDate: {
        doc: 'Publication date of the document',
        format: String,
        default: ''
      },
      DocumentSize: {
        doc: 'Size of the document',
        format: 'int',
        default: null
      },
      DocumentFormat: {
        doc: 'Format of the document',
        format: String,
        default: ''
      }
    }
  }
})

export default pestDocumentsApiSchema
