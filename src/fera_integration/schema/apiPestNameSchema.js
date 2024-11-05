import convict from 'convict'
 
// Custom format to handle both numbers and arrays of numbers
convict.addFormat({
  name: 'numberOrArray',
  validate: (val) => {
    if (val !== null && !Array.isArray(val) && typeof val !== 'number') {
      throw new Error('must be a number or an array of numbers')
    }
  }
})
 
const pestApiSchema = convict({
  PestRef: {
    doc: "Pest reference ID",
    format: Number,
    default: null
  },
  ParentPestRef: {
    doc: "Parent pest reference, can be a number or array of numbers",
    format:  '*',
    default: null
  },
  EppoCode: {
    doc: "EPPO code for the pest",
    format:  '*',
    default: ''
  },
  LatinName: {
    doc: "Latin name of the pest",
    format: String,
    default: ''
  },
  Kingdom: {
    doc: "Kingdom of the pest",
    format:  '*',
    default: ''
  },
  Phylum: {
    doc: "Phylum of the pest",
    format: '*',
    default: ''
  },
  Class: {
    doc: "Class of the pest",
    format:  '*',
    default: null
  },
  Order: {
    doc: "Order of the pest",
    format: '*',
    default: null
  },
  Family: {
    doc: "Family of the pest",
    format:  '*',
    default: null
  },
  Genus: {
    doc: "Genus of the pest",
    format:  '*',
    default: ''
  },
  Species: {
    doc: "Species of the pest",
    format:  '*',
    default: null
  },
  "TaxonomicLevel (F/G/S)": {
    doc: "Taxonomic level (Family, Genus, Species)",
    format: String,
    default: ''
  },
  ArrayPestCommonNames: {
    doc: "Array of pest common names",
    format: '*',
    default: null
  },
  ArrayPestSynonyms: {
    doc: "Array of pest synonyms",
    format:  '*',
    default: null
  }
})
 
export default pestApiSchema


