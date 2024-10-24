import { searchPlantDetailsDb, getpestplantLink, getpestDetails, searchPestDetailsDb, getCountries } from '~/src/api/search/helpers/search-mongodb';

describe('searchPlantDetailsDb', () => {
  let db;
  let logger;

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn()
    };
    logger = {
      info: jest.fn()
    };
  });

  it('should return plant details for LATIN_NAME, COMMON_NAME, and SYNONYM_NAME', async () => {
    const mockResults = [
      { PLANT_NAME: 'Rose', HOST_REF: '123', EPPO_CODE: '456' }
    ];
    db.toArray.mockResolvedValue(mockResults);

    const result = await searchPlantDetailsDb(db, 'rose', logger);

    expect(logger.info).toHaveBeenCalledWith('input text is rose');
    expect(result).toEqual([
      {
        id: 'latin-name',
        results: [
          { plantName: 'Rose', hostRef: '123', eppoCode: '456' }
        ]
      },
      {
        id: 'common-name',
        results: [
          { plantName: 'Rose', hostRef: '123', eppoCode: '456' }
        ]
      },
      {
        id: 'synonym-name',
        results: [
          { plantName: 'Rose', hostRef: '123', eppoCode: '456' }
        ]
      }
    ]);
  });

  it('should handle errors and return error message', async () => {
    const mockError = new Error('Database error');
    db.toArray.mockRejectedValue(mockError);

    const result = await searchPlantDetailsDb(db, 'rose', logger);

    expect(logger.info).toHaveBeenCalledWith(`Search query failed ${mockError}`);
    expect(result).toBe('Database error');
  });

  it('should return results for valid host references', async () => {
    const hostref = ['1', '2'];
    const mockResults = [
      { HOST_REF: 1, PLANT_NAME: 'Plant1' },
      { HOST_REF: 2, PLANT_NAME: 'Plant2' }
    ];
    db.toArray.mockResolvedValue(mockResults);

    const results = await getpestplantLink(db, hostref, logger);

    expect(results).toEqual(mockResults);
  });

  it('should return an error message if the query fails', async () => {
    const hostref = ['1', '2'];
    const errorMessage = 'Query failed';
    db.toArray.mockRejectedValue(new Error(errorMessage));

    const result = await getpestplantLink(db, hostref, logger);

    expect(result).toBe(errorMessage);
  });

  it('should return results for a valid CSL_REF', async () => {
    const cslref = '12345';
    const mockResults = [
      { CSL_REF: '12345', PEST_NAME: 'Pest1' },
      { CSL_REF: '12345', PEST_NAME: 'Pest2' }
    ];
    db.toArray.mockResolvedValue(mockResults);

    const results = await getpestDetails(db, cslref, logger);

    expect(results).toEqual(mockResults);
  });

  it('should return an error message if the query fails', async () => {
    const cslref = '12345';
    const errorMessage = 'Query failed';
    db.toArray.mockRejectedValue(new Error(errorMessage));

    const result = await getpestDetails(db, cslref, logger);

    expect(result).toBe(errorMessage);
  });

  it('should return an error message if the search fails', async () => {
    const searchText = 'pest';
    const errorMessage = 'Search query failed';
    db.toArray.mockRejectedValue(new Error(errorMessage));

    const result = await searchPestDetailsDb(db, searchText, logger);

    expect(logger.info).toHaveBeenCalledWith(`Search query failed Error: ${errorMessage}`);
    expect(result).toBe(errorMessage);
  });

  it('should return results for Latin name search', async () => {
    const searchText = 'pest';
    const mockResults = [
      {
        PEST_NAME: [{ type: 'LATIN_NAME', NAME: 'Pestus' }],
        CSL_REF: 'ref1',
        EPPO_CODE: 'code1'
      }
    ];
    db.toArray.mockResolvedValue(mockResults);

    const results = await searchPestDetailsDb(db, searchText, logger);
    expect(logger.info).toHaveBeenCalledWith(`input text is ${searchText}`);
    expect(results).toEqual([
      {
        id: 'latin-name',
        results: [
          {
            pestName: [{ type: 'LATIN_NAME', NAME: 'Pestus' }],
            cslRef: 'ref1',
            eppoCode: 'code1'
          }
        ]
      },
      {
        id: 'common-name',
        results: [
          {
            pestName: [{ type: 'LATIN_NAME', NAME: 'Pestus' }],
            cslRef: 'ref1',
            eppoCode: 'code1'
          }
        ]
      },
      {
        id: 'synonym-name',
        results: [
          {
            pestName: [{ type: 'LATIN_NAME', NAME: 'Pestus' }],
            cslRef: 'ref1',
            eppoCode: 'code1'
          }
        ]
      }
    ]);
  });

it('should return results from the COUNTRIES collection', async () => {
  const mockResults = [
    { COUNTRY_GROUPING: 'Group1' },
    { COUNTRY_GROUPING: 'Group2' }
  ];
  db.toArray.mockResolvedValue(mockResults);

  const results = await getCountries(db, logger);

  expect(results).toEqual(mockResults);
});

it('should return an error message if the query fails', async () => {
  const errorMessage = 'Query failed';
  db.toArray.mockRejectedValue(new Error(errorMessage));

  const result = await getCountries(db, logger);

  expect(logger.info).toHaveBeenCalledWith(`Countries could not be fetched Error: ${errorMessage}`);
  expect(result).toBe(errorMessage);
});


});
