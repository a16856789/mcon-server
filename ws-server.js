var WebSocketServer = require('ws').Server;
var SimpleMsgRpc = require('simple-msg-rpc');
var clients = require('./clients'), Client = clients.Client;
var services = require('./services');
var logger = require('./logger').getLogger('ws-server');

/**
 * the constructor
 */
function WsClient(webSocket) {
    // call the super
    Client.call(this);
    if (!this.id) {
        this.id = clients.genId();
    }

    // init
    this.inited = false;
    this.webSocket = webSocket;
    this.rpc = null;
}
WsClient.prototype = new Client();

/**
 * init this client
 */
WsClient.prototype.init = function() {
    // init rpc
    var self = this;
    self.rpc = new SimpleMsgRpc({
        msgAdapter: {
            send: function(message) {
                self.webSocket.send(message);
            }
        },
        requestProcessor: {
            invoke: function(headers, serviceId, methodName, params, callback) {
                headers = headers || {};
                headers.clientId = self.id;
                services.invoke({
                    headers: headers,
                    serviceId: serviceId,
                    methodName: methodName,
                    params: params
                }, function(err, response) {
                    if (err) {
                        logger.error(err);
                    }
                    callback(err, response);
                });
            }
        }
    });

    // on message received, delegate to rpc
    self.webSocket.on('message', function(msg) {
        self.rpc.processMessage(msg);
    });

    // when the connection close, destroy it
    self.webSocket.on('close', function(code, msg) {
        logger.info('A WebSocket client closed with code: %s, msg: %s', code, msg);
        self.destroy();
    });

    // log
    self.webSocket.on('error', function(error) {
        logger.error('WebSocket econters a error.');
        logger.error(error);
    });
    logger.info('New WebSocket connected.');

    // add to the clients
    clients.add(self);
    self.inited = true;
};

/**
 * destroy this client
 */
WsClient.prototype.destroy = function() {
    if (!this.inited) return;
    if (this.id) {
        clients.remove(this.id);
    }
    if (this.ws) {
        this.ws.close();
    }
    this.inited = false;
};

/**
 * invoke the client
 */
WsClient.prototype.invoke = function() {
    this.rpc.invoke.apply(this.rpc, arguments);
}

/**
 * ws server
 */
wsServer = {
    port: 8125,
    WsClient: WsClient
};

/**
 * init the ws server
 */
wsServer.init = function() {
    // init config
    var port = this.port;

    // create the WebSocketServer
    var wss = this.wss = new WebSocketServer({
        host: '127.0.0.1',
        port: port
    });

    // create and init an client when connected
    wss.on('connection', function(ws) {
        var client = new WsClient(ws);
        client.init();
    });

    // logger
    wss.on('error', function(error) {
        logger.error('WebSocketServer econters a error.', error);
    });
    logger.info('WebSocket server startd at port: ' + port);
};

/*
 * Exports
 */
module.exports = wsServer;
