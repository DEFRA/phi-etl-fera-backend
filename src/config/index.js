import path from 'node:path'
import convict from 'convict'

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3049,
    env: 'PORT'
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'cdp-example-node-backend'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.normalize(path.join(__dirname, '..', '..'))
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  mongoUri: {
    doc: 'URI for mongodb',
    format: '*',
    default: 'mongodb://127.0.0.1:27017/',
    env: 'MONGO_URI'
  },
  mongoDatabase: {
    doc: 'database for mongodb',
    format: String,
    default: 'phi-etl-fera-backend',
    env: 'MONGO_DATABASE'
  },
  openSearchUri: {
    doc: 'OpenSearch URI',
    format: '*',
    default: 'http://127.0.0.1:9200/',
    env: 'OS_URI'
  },
  openSearchUserName: {
    doc: 'OpenSearch user name',
    format: '*',
    default: '',
    env: 'OS_USERNAME'
  },
  openSearchPwd: {
    doc: 'OpenSearch password',
    format: '*',
    default: '',
    env: 'OS_PASSOWRD'
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTP_PROXY'
  },
  httpsProxy: {
    doc: 'HTTPS Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTPS_PROXY'
  },
  readTimeout: {
    doc: 'Read timeout value in milliseconds for I/O operations',
    format: String,
    default: '10000',
    env: 'READ_TIMEOUT'
  },
  fera: {
    cert: {
      doc: 'base64 encoded string',
      format: '*',
      default: '',
      env: 'FERA_CERT'
    },
    pwd: {
      doc: 'FERA env pwd',
      format: '*',
      default: '',
      env: 'FERA_PWD'
    }
  },
  aws: {
    region: {
      doc: 'AWS region',
      format: String,
      default: 'eu-west-2',
      env: 'AWS_REGION'
    },
    s3: {
      endpoint: {
        doc: 'AWS S3 endpoint',
        format: String,
        default: 'http://localhost:4566',
        env: 'S3_ENDPOINT'
      },
      forcePathStyle: {
        doc: 'AWS S3 forcePathStyle option',
        format: Boolean,
        default: process.env.NODE_ENV !== 'production'
      }
    }
  },
  s3BucketConfig: {
    doc: 'aws s3 bucket',
    format: String,
    default: 's3://dev-phi-etl-fera-backend-c63f2/',
    env: 'S3_BUCKET'
  }
})

config.validate({ allowed: 'strict' })

export { config }
