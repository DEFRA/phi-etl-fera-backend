class workflowEngine {
  constructor(plantDocument, searchInput) {
    this.data = plantDocument
    this.checkComplete = false
    this.type = ''
    this.annexSixRuleType = ''
    this.annexElevenRuleType = ''
    this.outcome = ''
    this.country = searchInput.plantDetails.country
    this.serviceFormat = searchInput.plantDetails.serviceFormat
    this.hostRef = searchInput.plantDetails.hostRef
  }

  execute() {
    throw new Error("Method 'execute()' must be implemented.")
  }
}

export { workflowEngine }
