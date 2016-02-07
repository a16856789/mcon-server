var clients = require('./clients');
var logger = require('./logger').getLogger('services');

/**
 * @class Service
 */
function Service(id) {
    this.id = id;
    this.clientIds = {};
}

/**
 * @module services
 */
services = {
    services: {},
    Service: Service,
    get: function(id) {
        return this.services[id];
    },
    add: function(serviceId, clientId) {
        var s = this.services[serviceId];
        if (!s) {
            s = this.services[serviceId] = new Service(serviceId);
        }
        s.clientIds[clientId] = clientId;
        logger.info('Service added, serviceId=%s, clientId=%s', serviceId, clientId);
    },
    remove: function(serviceId, clientId) {
        var s = this.services[serviceId];
        if (s) {
            if (s.clientIds[clientId]) {
                delete s.clientIds[clientId];
                if (Object.keys(s.clientIds).length <= 0) {
                    delete this.services[serviceId];
                }
                logger.info('Service removed, serviceId=%s, clientId=%s', serviceId, clientId);
            }
        }
    },
    removeByClient: function(clientId) {
        for (serviceId in this.services) {
            this.remove(serviceId, clientId);
        }
    },
    invoke: function(conf, callback) {
        var s = this.get(conf.serviceId);
        if (s) {
            var clientId = Object.keys(s.clientIds)[0];
            return this.clientInvoker.invoke(clientId, arguments);
        } else {
            callback('no servcie whose id is ' + conf.serviceId);
        }
    },
    clientInvoker: {
        invoke: function(clientId, args) {
            throw Error('Must Impl It In Clients');
        }
    }
}

/**
 * exports
 */
module.exports = services;
