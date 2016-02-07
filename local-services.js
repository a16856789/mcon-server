var localServer = require('./local-server');
var services = require('./services');
var clients = require('./clients');

localServer.registerService('mcon.EchoTest', {
    echo: function(msg) {
        return 'echo back: ' + msg;
    }
});

localServer.registerService('mcon.ServiceManager', {
    listAll: function() {
        var map  = services.services;
        var list = Object.keys(map).map(function(id) {
            return {
                serviceId: id,
                clientIds: Object.keys(map[id].clientIds)
            }
        });
        return list;
    }
});

localServer.registerService('mcon.ClientManager', {
    listAll: function() {
        var map  = clients.clients;
        var list = Object.keys(map).map(function(id) {
            var client = map[id];
            return {
                clientId: id,
                name: client.name,
                version: client.version,
                connType: client.connType,
                serviceIds: client.serviceIds
            }
        });
        return list;
    },
    invokeUpdateMeta: function(headers, params, callback) {
        var clientId = headers.clientId;
        if (clientId) {
            var meta = params[0];
            var result = clients.updateMeta(clientId, meta);
            callback(null, result);
        } else {
            callback('clientId is missing');
        }
    }
});
