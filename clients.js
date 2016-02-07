var services = require('./services');
var logger = require('./logger').getLogger('clients');

/**
 * @class Client
 */
function Client() {
    // mgr by parents
    this.name = '';
    this.version = '';
    this.serviceIds = []; // the servcie ids this client can provide
    // set by sub type
    this.connType = Client.WS;
}

/**
 * utils
 */
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * regist service
 */
Client.prototype.registerService = function(serviceId) {
    this.serviceIds[serviceId] = serviceId;
    services.add(serviceId, this.id);
}

Client.prototype.cancelServcie = function(serviceId) {
    delete this.services[serviceId];
    services.remove(serviceId, this.id);
}

/**
 * @see simple-msg-rpc's invoke
 */
Client.prototype.invoke = function(conf, callback) {
    throw 'shoud overwrite by sub class';
}

/**
 * @contansts Client's connType
 */
Client.WS = 'ws';

/**
 * @module clients
 */
var clients = {
    // id manager
    curId: 1,
    genId: function() {
        return '' + (this.curId++);
    },

    // client manager
    clients: {},
    Client: Client,
    get: function(id) {
        return this.clients[id];
    },
    add: function(client) {
        // if id is empty, gen one
        if (!client.id) {
            client.id = this.genId();
        }
        // if client already exists, return
        var c = client;
        if (this.clients[c.id]) {
            return;
        }
        // add all the services
        this.updateServices(c.id, c.serviceIds);
        // add to the client list
        this.clients[c.id] = c;
        // log
        logger.info('Client added, clientId=%s, connType=%s.', c.id, c.connType);
        return client;
    },
    remove: function(id) {
        // get client id
        if (typeof(id) === 'object') {
            id = id.id;
        }
        // remote all the services
        services.removeByClient(id);
        // remote from client list
        delete this.clients[id];
        // log
        logger.info('Client removed, clientId=%s', id);
    },
    updateServices: function(clientId, serviceIds) {
        var client = this.get(clientId);
        if (!client || arraysEqual(client.serviceIds, serviceIds)) {
            return;
        }
        client.serviceIds = serviceIds;
        services.removeByClient(clientId);
        serviceIds.forEach(function(serviceId) {
            services.add(serviceId, clientId);
        });
        logger.info('Client %s updateServices as:\n%s', clientId, serviceIds.map(function(x) {
            return '    '  + x;
        }).join('\n'));
    },
    updateMeta: function(clientId, meta) {
        var client = this.get(clientId);
        if (client) {
            client.name = meta.name;
            client.version = meta.version;
            if (meta.serviceIds) {
                this.updateServices(clientId, meta.serviceIds);
            }
        }
    }
}

/**
 * inject depedence of services
 */
services.clientInvoker.invoke = function(clientId, args) {
    var client = clients.get(clientId);
    return client.invoke.apply(client, args);
}


/**
 * exports
 */
module.exports = clients;
