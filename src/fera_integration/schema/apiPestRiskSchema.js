import convict from 'convict'

const pestRiskApiSchema = convict({
  PestRef: {
    doc: 'Reference ID for the pest',
    format: 'int',
    default: null
  },
  ArrayRiskCountry: {
    doc: 'Array of countries with pest risk information',
    format: Array,
    default: [],
    children: {
      CountryCode: {
        doc: 'Country code',
        format: String,
        default: ''
      },
      CountryName: {
        doc: 'Country name',
        format: String,
        default: ''
      },
      RiskCountryStatus: {
        doc: 'Risk status in the country',
        format: String,
        default: ''
      },
      RiskCountryNotes: {
        doc: 'Notes related to risk in the country',
        format: String,
        default: null
      }
    }
  }
})

export default pestRiskApiSchema
