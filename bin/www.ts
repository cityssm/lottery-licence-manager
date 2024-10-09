/* eslint-disable no-process-exit, unicorn/no-process-exit */

import http from 'node:http'

import debug from 'debug'
import exitHook from 'exit-hook'

import { app } from '../app.js'
import * as configFunctions from '../helpers/functions.config.js'

const debugWWW = debug('lottery-licence-manager:www')

let httpServer: http.Server

interface ServerError extends Error {
  syscall: string
  code: string
}

const onError = (error: ServerError) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    // eslint-disable-next-line no-fallthrough
    case 'EACCES': {
      debugWWW('Requires elevated privileges')
      process.exit(1)
    }
    // break;

    // eslint-disable-next-line no-fallthrough
    case 'EADDRINUSE': {
      debugWWW('Port is already in use.')
      process.exit(1)
    }
    // break;

    // eslint-disable-next-line no-fallthrough
    default: {
      throw error
    }
  }
}

const onListening = (server: http.Server) => {
  const addr = server.address()

  const bind =
    typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port.toString()

  debugWWW('Listening on ' + bind)
}

/**
 * Initialize HTTP
 */

const httpPort = configFunctions.getProperty('application.httpPort')

if (httpPort) {
  httpServer = http.createServer(app)

  httpServer.listen(httpPort)

  httpServer.on('error', onError)
  httpServer.on('listening', () => {
    onListening(httpServer)
  })

  debugWWW('HTTP listening on ' + httpPort.toString())
}

exitHook(() => {
  if (httpServer) {
    debugWWW('Closing HTTP')
    httpServer.close()
    httpServer = undefined
  }
})
