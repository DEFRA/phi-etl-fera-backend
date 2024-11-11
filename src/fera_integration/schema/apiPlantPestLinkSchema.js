import convict from 'convict'
 
const plantPestLinkApiSchema = convict({
  HostRef: {
    doc: "Reference ID for the host",
    format: 'int',
    default: null
  },
  ArrayHostPest: {
    doc: "Array of host-pest relationships",
    format: Array,
    default: [],
    children: {
      PestRef: {
        doc: "Reference ID for the pest",
        format: 'int',
        default: null
      },
      HostClass: {
        doc: "Classification of the host",
        format: String,
        default: ''
      }
    }
  }
})
 
export default plantPestLinkApiSchema
 

