import tls from 'node:tls'

import { getTrustStoreCerts } from '~/src/helpers/secure-context/get-trust-store-certs'

const secureContext = {
  plugin: {
    name: 'secure-context',
    register: async (server) => {
      server.decorate(
        'server',
        'secureContext',
        createSecureContext(server.logger)
      )
    }
  }
}

function createSecureContext(logger) {
  const originalCreateSecureContext = tls.createSecureContext

  tls.createSecureContext = (options = {}) => {
    const trustStoreCerts = getTrustStoreCerts(process.env)

    if (!trustStoreCerts.length) {
      logger?.info('Could not find any TRUSTSTORE_ certificates')
    }

    const secureContext = originalCreateSecureContext(options)

    trustStoreCerts.forEach((cert) => {
      secureContext.context.addCACert(cert)
    })

    return secureContext
  }
  return tls.createSecureContext()
}

export { createSecureContext, secureContext }
