// Import the classes
import { InnsStrategy } from '~/src/strategies/innsStrategy';
import { ProhibitedStrategy } from '~/src/strategies/prohibitedStrategy';
import { WorkflowStrategyFactory } from '~/src/factories/workflowStrategyFactory';

// Mock the InnsStrategy and ProhibitedStrategy classes
jest.mock('~/src/strategies/innsStrategy');
jest.mock('~/src/strategies/prohibitedStrategy');

describe('WorkflowStrategyFactory', () => {
  let factory;
  let loggerMock;
  let dbMock;
  let searchInputMock;
  let plantDocumentMock;
  let plantNameDocMock;
  let countryMappingMock;

  beforeEach(() => {
    loggerMock = { info: jest.fn(), error: jest.fn() };
    dbMock = {
      collection: jest.fn().mockReturnThis(),
      findOne: jest.fn()
    };
    searchInputMock = { plantDetails: { country: 'country', serviceFormat: 'format', hostRef: 'ref' } };
    plantDocumentMock = { HOST_REF: 'ref', EPPO_CODE: 'EPPO123', PLANT_NAME: 'PlantName', HOST_REGULATION: { ANNEX6: [] }, PEST_LINK: [] };
    plantNameDocMock = { HOST_REF: 'ref' };
    countryMappingMock = { COUNTRY_NAME: 'country' };

    dbMock.findOne.mockResolvedValueOnce(plantDocumentMock).mockResolvedValueOnce(plantNameDocMock).mockResolvedValueOnce(countryMappingMock);

    InnsStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({ outcome: 'prohibited', hostRef: 'ref', country: 'country' })
      };
    });

    ProhibitedStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({ outcome: 'prohibited', hostRef: 'ref', country: 'country' })
      };
    });

    factory = new WorkflowStrategyFactory(loggerMock);
  });

//   it('should handle undefined countryDetails gracefully', async () => {
//     dbMock.findOne.mockResolvedValueOnce(plantDocumentMock).mockResolvedValueOnce(plantNameDocMock).mockResolvedValueOnce(null);

//     await expect(factory.initateStrategy(searchInputMock, dbMock)).rejects.toThrow('No matching strategy found.');

//     expect(loggerMock.info).toHaveBeenCalledWith(`No country details found for ${searchInputMock.plantDetails.country}`);
//   });

  it('should return plantInfo when INNS strategy is applicable', async () => {
    const result = await factory.initateStrategy(searchInputMock, dbMock);

    expect(loggerMock.info).toHaveBeenCalledWith(searchInputMock);
    expect(loggerMock.info).toHaveBeenCalledWith('trigger - INNS check');
    expect(result).toEqual({ outcome: 'prohibited', hostRef: 'ref', country: 'country' });
  });

  it('should return plantInfo when Prohibited strategy is applicable', async () => {
    InnsStrategy.mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue({ outcome: '', hostRef: 'ref', country: 'country' })
      };
    });

    const result = await factory.initateStrategy(searchInputMock, dbMock);

    expect(loggerMock.info).toHaveBeenCalledWith(searchInputMock);
    expect(loggerMock.info).toHaveBeenCalledWith('trigger - prohibited check');
    expect(result).toEqual({ outcome: 'prohibited', hostRef: 'ref', country: 'country' });
  });

//   it('should resolve when no matching strategy is found', async () => {
//     InnsStrategy.mockImplementation(() => {
//       return {
//         execute: jest.fn().mockResolvedValue({ outcome: '', hostRef: 'ref', country: 'country' })
//       };
//     });

//     ProhibitedStrategy.mockImplementation(() => {
//       return {
//         execute: jest.fn().mockResolvedValue({ outcome: '', hostRef: 'ref', country: 'country' })
//       };
//     });

//     await expect(factory.initateStrategy(searchInputMock, dbMock)).resolves.toThrow('No matching strategy found.');
//   });
});
