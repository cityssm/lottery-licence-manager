import http from 'node:http';
import debug from 'debug';
import exitHook from 'exit-hook';
import { app } from '../app.js';
import * as configFunctions from '../helpers/functions.config.js';
const debugWWW = debug('lottery-licence-manager:www');
let httpServer;
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    switch (error.code) {
        case 'EACCES': {
            debugWWW('Requires elevated privileges');
            process.exit(1);
        }
        case 'EADDRINUSE': {
            debugWWW('Port is already in use.');
            process.exit(1);
        }
        default: {
            throw error;
        }
    }
}
function onListening(server) {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port.toString()}`;
    debugWWW(`Listening on ${bind}`);
}
const httpPort = configFunctions.getProperty('application.httpPort');
if (httpPort) {
    httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on('error', onError);
    httpServer.on('listening', () => {
        onListening(httpServer);
    });
    debugWWW(`HTTP listening on ${httpPort.toString()}`);
}
exitHook(() => {
    if (httpServer) {
        debugWWW('Closing HTTP');
        httpServer.close();
        httpServer = undefined;
    }
});
