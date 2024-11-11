import pestDocumentsApiSchema from './schema/apiPestDocsSchema.js'
import pestDocumentsMongoSchema from './schema/pestDocsSchema.js'
// import { logAndWriteTransformedData } from './utility/dataUtil.js'

const apiToMongoFieldMap = {
  PestRef: 'CSL_REF',
  ArrayDocumentation: {
    DocumentTitle: 'DOCUMENT_TITLE',
    DocumentType: 'DOCUMENT_TYPE',
    VisibleOnPHPortal: 'VISIBLE_ON_PHI_INDICATOR',
    DocumentHyperlink: 'DOCUMENT_HYPER_LINK',
    PublicationDate: 'PUBLICATION_DATE',
    DocumentSize: 'DOCUMENT_SIZE',
    DocumentFormat: 'DOCUMENT_FORMAT'
  }
}

export const transformPestDocumentsData = async (data) => {
  const transformedData = await Promise.all(
    data.flatMap((apiItem) => {
      const apiValidated = pestDocumentsApiSchema
        .load(apiItem)
        .validate()
        .getProperties()
      const documentRecords = []

      apiValidated.ArrayDocumentation.forEach((document) => {
        const mongoItem = {}

        mongoItem[apiToMongoFieldMap.PestRef] = apiValidated.PestRef
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.DocumentTitle] =
          document.DocumentTitle || ''
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.DocumentType] =
          document.DocumentType || ''
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.VisibleOnPHPortal] =
          document.VisibleOnPHPortal
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.DocumentHyperlink] =
          document.DocumentHyperlink || ''
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.PublicationDate] =
          document.PublicationDate || ''
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.DocumentSize] =
          document.DocumentSize || null
        mongoItem[apiToMongoFieldMap.ArrayDocumentation.DocumentFormat] =
          document.DocumentFormat || ''

        // Validate the final mapped object against the MongoDB schema
        const validatedMongoItem = pestDocumentsMongoSchema
          .load(mongoItem)
          .validate()
          .getProperties()
        documentRecords.push(validatedMongoItem)
      })

      return documentRecords
    })
  )

  // Wrap the transformed data in the root structure required by MongoDB
  const outputData = { PEST_DOCUMENT_FCPD: transformedData }
  return outputData

  // ============================================================================================
  // RETAIN THE FOLLOWING CODE FOR TESTING THE FEATURE LOCALLY, DELETE WHEN DONE
  // ============================================================================================
  // logAndWriteTransformedData(transformedData, PestDocumentsData-transformed.json)
}
