import { updateDbPestHandler, loadData, getPestList, preparePestDetails } from './update-db-pest';
import { createLogger } from '~/src/helpers/logging/logger';
import { pestDetail } from '../models/pestDetail';
import * as myModule from './update-db-pest';

jest.mock('~/src/helpers/logging/logger');
jest.mock('../models/pestDetail', () => ({
  pestDetail: {
    get: jest.fn(() => ({
      EPPO_CODE: '',
      CSL_REF: '',
      LATIN_NAME: '',
      PEST_NAME: []
    }))
  }
}));

jest.mock('./update-db-pest', () => {
  const originalModule = jest.requireActual('./update-db-pest');
  return {
    ...originalModule,
    isLocked: true,
    loadData: jest.fn(),
    getPestList: jest.fn(),
    preparePestDetails: jest.fn()
  };
});


describe('updateDbPestHandler', () => {
  let request;
  let h;
  let db;
  let logger;
  let isLocked;

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{
            PEST_NAME: [],
            PLANT_PEST_REG: [],
            PEST_PRA_DATA: [],
            PEST_DOCUMENT_FCPD: [],
            PEST_DISTRIBUTION: [],
          }]),
        })
      }),
      dropCollection: jest.fn(),
      listCollections: jest.fn().mockReturnThis({ name: 'PEST_DATA' }),
      toArray: jest.fn(),
      insertMany: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      })
    },
    logger = {
      info: jest.fn(),
      error: jest.fn()
    };
    createLogger.mockReturnValue(logger);
    request = { server:
       {  db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{
              PEST_NAME: [],
              PLANT_PEST_REG: [],
              PEST_PRA_DATA: [],
              PEST_DOCUMENT_FCPD: [],
              PEST_DISTRIBUTION: [],
            }]),
          })
        }),
      dropCollection: jest.fn(),
      listCollections: jest.fn().mockReturnThis({ name: 'PEST_DATA' }),
      toArray: jest.fn(),
      insertMany: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      })
    } } };
    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 429 if isLocked is true', async () => {
    isLocked = true
    await updateDbPestHandler(request, h, isLocked);
    expect(h.response).toHaveBeenCalledWith({
      status: 'Info',
      message: "/udpatePest load in progress, please try again later if required.",
    });
  });

  it('should call loadData and return success response', async () => {
    isLocked = false
    // await db.collection().find().toArray.mockResolvedValueOnce([{ PEST_NAME: [] }]);
    await loadData(request.server.db)
    await updateDbPestHandler(request, h, isLocked)
    expect(h.response).toHaveBeenCalledWith({
      status: 'success',
      message: 'Update Pest Db successful'
    })
    expect(h.code).not.toHaveBeenCalled()
  })

  it('should log error and return error response if loadData throws', async () => {
    isLocked = false
    const error = new Error('Test error');
    console.log('logger1111', logger)
    await loadData.mockImplementation(() => {
      throw error
    })
    db.collection = await jest.fn().mockReturnValue({
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockRejectedValue(new Error('Database error')),
      }),
    });
    // await loadData(db)
    // expect(loadData).toHaveBeenCalledWith(request.server.db);
    await updateDbPestHandler(request, h, isLocked);
    
    // expect(logger.error).toHaveBeenCalledWith(error);
    expect(h.response).toHaveBeenCalledWith({
      status: 'error',
      message: error.message
    });
    expect(h.code).toHaveBeenCalledWith(500);
  });
});

// describe('loadData', () => {
//   let db;
//   let logger;

//   beforeEach(() => {
//     db = {
//       collection: jest.fn().mockReturnThis(),
//       listCollections: jest.fn().mockReturnThis(),
//       toArray: jest.fn().mockResolvedValue([]),
//       drop: jest.fn(),
//       insertMany: jest.fn()
//     };
//     logger = {
//       info: jest.fn(),
//       error: jest.fn()
//     };
//     createLogger.mockReturnValue(logger);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   // it('should log info and call necessary functions', async () => {
//   //   getPestList.mockResolvedValue([]);
//   //   await loadData(db);
//   //   expect(logger.info).toHaveBeenCalledWith('Connected successfully to server');
//   //   expect(getPestList).toHaveBeenCalledWith(db);
//   //   expect(logger.info).toHaveBeenCalledWith('pestList: 0');
//   // });

//   // it('should log error if an error occurs', async () => {
//   //   const error = new Error('Test error');
//   //   getPestList.mockImplementation(() => {
//   //     throw error;
//   //   });
//   //   await loadData(db);
//   //   expect(logger.error).toHaveBeenCalledWith(error);
//   // });

//   // it('should reset isLocked to false after execution', async () => {
//   //   await loadData(db);
//   //   expect(isLocked).toBe(false);
//   // });
// });
