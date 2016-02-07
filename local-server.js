var BeanInvoker = require('simple-msg-rpc').BeanInvoker;
var clients = require('./clients');

var localClient = new clients.Client();
localClient.connType = 'local';
localClient.invoke = function(conf, callback) {
    var bean = localServer.services[conf.serviceId];
    BeanInvoker.invoke.apply(bean, arguments);
};
clients.add(localClient);

var localServer = {
    localClient: localClient,
    services: {}, // serviceId -> serviceBean
    registerService: function(serviceId, serviceBean) {
        this.services[serviceId] = serviceBean;
    },
    init: function() {
        clients.updateMeta(localClient.id, {
            name: 'local',
            version: 'server-' + require('./package.json').version,
            serviceIds: Object.keys(this.services)
        });
    }
}
module.exports = localServer;
