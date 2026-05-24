import { MongoClient } from 'mongodb'
import { config } from '~/src/config'
import { createMongoClient, mongoPlugin } from '~/src//helpers/mongodb'

jest.mock('mongodb')
jest.mock('~/src/config')

describe('mongoPlugin', () => {
  let server
  let logger
  let client

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn()
    }

    server = {
      decorate: jest.fn(),
      secureContext: {},
      logger
    }

    client = {
      db: jest.fn().mockReturnThis(),
      close: jest.fn()
    }

    MongoClient.connect.mockResolvedValue(client)
    config.get = jest.fn((key) => {
      if (key === 'mongoUri') return 'mongodb://localhost:27017'
      if (key === 'mongoDatabase') return 'testdb'
    })
  })

  it('should register mongo client and db on the server', async () => {
    await mongoPlugin.register(server)

    expect(MongoClient.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017',
      {
        retryWrites: false,
        readPreference: 'secondary',
        secureContext: {}
      }
    )

    expect(server.decorate).toHaveBeenCalledWith(
      'server',
      'mongoClient',
      client
    )
    expect(server.decorate).toHaveBeenCalledWith('server', 'db', client.db())
    expect(server.decorate).toHaveBeenCalledWith('request', 'db', client.db())
    expect(logger.info).toHaveBeenCalledWith('Setting up mongodb')
  })

  it('should create mongo client and db', async () => {
    const result = await createMongoClient(server.secureContext, logger)

    expect(MongoClient.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017',
      {
        retryWrites: false,
        readPreference: 'secondary',
        secureContext: {}
      }
    )

    expect(result).toEqual({ client, db: client.db() })
    expect(logger.info).toHaveBeenCalledWith('Setting up mongodb')
  })
})
