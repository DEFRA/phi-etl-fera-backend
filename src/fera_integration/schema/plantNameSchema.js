import convict from 'convict'

const plantSchema = convict({
  HOST_REF: {
    doc: 'Reference ID for the host in MongoDB',
    format: Number,
    default: null
  },
  PARENT_HOST_REF: {
    doc: 'Parent reference ID in MongoDB',
    format: '*',
    default: null
  },
  EPPO_CODE: {
    doc: 'EPPO code for plant',
    format: '*',
    default: ''
  },
  LATIN_NAME: {
    doc: 'Latin name of the plant',
    format: String,
    default: ''
  },
  KINGDOM_NAME: {
    doc: 'Kingdom of the plant',
    format: '*',
    default: ''
  },
  PHYLUM_NAME: {
    doc: 'Phylum of the plant',
    format: '*',
    default: ''
  },
  CLASS_NAME: {
    doc: 'Class of the plant',
    format: '*',
    default: ''
  },
  CATEGORY_NAME: {
    doc: 'Category of the plant',
    format: '*',
    default: ''
  },
  ORDER_NAME: {
    doc: 'Order of the plant',
    format: '*',
    default: ''
  },
  FAMILY_NAME: {
    doc: 'Family of the plant',
    format: '*',
    default: ''
  },
  SUBFAMILY_NAME: {
    doc: 'Subfamily of the plant',
    format: '*',
    default: null
  },
  GENUS_NAME: {
    doc: 'Genus of the plant',
    format: '*',
    default: ''
  },
  SPECIES_NAME: {
    doc: 'Species of the plant',
    format: '*',
    default: ''
  },
  LEVEL_OF_TAXONOMY: {
    doc: 'Level of taxonomy',
    format: String,
    default: ''
  },
  SYNONYM_NAME: {
    doc: 'Synonym names with IDs',
    format: Object,
    default: {
      ID: [],
      NAME: []
    }
  },
  COMMON_NAME: {
    doc: 'Common names with IDs',
    format: Object,
    default: {
      ID: [],
      NAME: []
    }
  }
})

export default plantSchema
