import { workflowEngine } from './workflowEngine';

describe('workflowEngine', () => {
  let plantDocumentMock;
  let plantNameDocMock;
  let searchInputMock;
  let countryMappingMock;
  let cdpLoggerMock;
  let engine;

  beforeEach(() => {
    plantDocumentMock = { EPPO_CODE: 'E123', PLANT_NAME: 'PlantName' };
    plantNameDocMock = { HOST_REF: 245 };
    searchInputMock = { plantDetails: { country: 'specificCountry', serviceFormat: 'plants for planting', hostRef: 'ref' } };
    countryMappingMock = { COUNTRY_NAME: 'specificCountry' };
    cdpLoggerMock = { info: jest.fn(), error: jest.fn() };

    engine = new workflowEngine(
      plantDocumentMock,
      plantNameDocMock,
      searchInputMock,
      countryMappingMock,
      cdpLoggerMock
    );
  });

  it('should initialize with correct properties', () => {
    expect(engine.data).toBe(plantDocumentMock);
    expect(engine.type).toBe('');
    expect(engine.decision).toBe('');
    expect(engine.country).toBe('specificCountry');
    expect(engine.serviceFormat).toBe('plants for planting');
    expect(engine.hostRef).toBe('ref');
    expect(engine.countryDetails).toBe(countryMappingMock);
    expect(engine.loggerObj).toBe(cdpLoggerMock);
    expect(engine.plantNameDoc).toBe(plantNameDocMock);
  });

  it('should throw an error when execute is called', () => {
    expect(() => engine.execute()).toThrow("Method 'execute()' must be implemented.");
  });
});
