import convict from 'convict'

const apiPlantNameSchema = convict({
  HostRef: {
    doc: 'Reference ID for the host',
    format: Number,
    default: null
  },
  ParentHostRef: {
    doc: 'Parent reference ID',
    format: '*',
    default: null
  },
  EppoCode: {
    doc: 'EPPO code for the plant',
    format: '*',
    default: ''
  },
  LatinName: {
    doc: 'Latin name of the plant',
    format: String,
    default: ''
  },
  Kingdom: {
    doc: 'Kingdom of the plant',
    format: '*',
    default: ''
  },
  Phylum: {
    doc: 'Phylum of the plant',
    format: '*',
    default: ''
  },
  Class: {
    doc: 'Class of the plant',
    format: '*',
    default: ''
  },
  Category: {
    doc: 'Category of the plant',
    format: '*',
    default: ''
  },
  Order: {
    doc: 'Order of the plant',
    format: '*',
    default: ''
  },
  Family: {
    doc: 'Family of the plant',
    format: '*',
    default: ''
  },
  Subfamily: {
    doc: 'Subfamily of the plant',
    format: '*',
    default: null
  },
  Genus: {
    doc: 'Genus of the plant',
    format: '*',
    default: ''
  },
  Species: {
    doc: 'Species of the plant',
    format: '*',
    default: ''
  },
  'TaxonomicLevel (F/G/S)': {
    doc: 'Taxonomic level (Family, Genus, Species)',
    format: String,
    default: ''
  },
  ArrayCommonNames: {
    doc: 'Array of common names',
    format: '*',
    default: []
  },
  ArraySynonyms: {
    doc: 'Array of synonyms',
    format: '*',
    default: []
  }
})

export default apiPlantNameSchema
