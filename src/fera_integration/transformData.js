export const transformData = (data) => {
    // Example transformation - adapt as needed for MongoDB schema
    return data.map(item => ({
      name: item.plantName || item.pestName,
      details: item.details,
    }))
  }