import { pestplantlinkController } from '~/src/api/search/pestplantlink-controller';
import { getpestplantLink } from '~/src/api/search/helpers/search-mongodb';

jest.mock('~/src/api/search/helpers/search-mongodb');

describe('pestplantlinkController', () => {
  let request;
  let h;

  beforeEach(() => {
    request = {
      payload: { hostRefs: [1, 2, 3] },
      db: {},
      logger: { error: jest.fn() }
    };

    h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    };
  });

  it('should return pest link details with status 200', async () => {
    const mockResult = [{ plantName: 'Plant1', hostRef: 1, eppoCode: 'E123' }];
    getpestplantLink.mockResolvedValue(mockResult);

    await pestplantlinkController.handler(request, h);

    expect(getpestplantLink).toHaveBeenCalledWith(request.db, [1, 2, 3], request.logger);
    expect(h.response).toHaveBeenCalledWith({ pest_link: mockResult });
    expect(h.code).toHaveBeenCalledWith(200);
  });

  it('should handle errors and return status 500', async () => {
    const mockError = new Error('Database error');
    getpestplantLink.mockRejectedValue(mockError);

    await pestplantlinkController.handler(request, h);

    expect(h.response).toHaveBeenCalledWith({ error: mockError.message });
    expect(h.code).toHaveBeenCalledWith(500);
  });
});
