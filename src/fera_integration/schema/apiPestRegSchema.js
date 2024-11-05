import convict from 'convict'
 
const pestRegulationApiSchema = convict({
  PestRef: {
    doc: "Reference ID for the pest",
    format: Number,
    default: null
  },
  ArrayRegulation: {
    doc: "Array of regulations",
    format: Array,
    default: [],
    children: {
      RegulationID: {
        doc: "Regulation ID",
        format: Number,
        default: null
      },
      Regulation: {
        doc: "Regulation name",
        format: String,
        default: ''
      },
      RegulationCategoryId: {
        doc: "Regulation category ID",
        format: Number,
        default: null
      },
      RegulationCategory: {
        doc: "Category of the regulation",
        format: String,
        default: ''
      },
      RegulationCategoryDescription: {
        doc: "Description of the regulation category",
        format: String,
        default: null
      },
      ArrayRegulationHost: {
        doc: "Array of regulation hosts",
        format: Array,
        default: [],
        children: {
          HostRef: {
            doc: "Host reference ID",
            format: Number,
            default: null
          },
          HostFormatId: {
            doc: "Host format ID",
            format: Number,
            default: null
          },
          HostFormat: {
            doc: "Host format name",
            format: String,
            default: null
          }
        }
      }
    }
  }
})
 
export default pestRegulationApiSchema