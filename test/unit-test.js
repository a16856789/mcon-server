var assert = require("assert");
var localServer = require('../local-server');
var services = require('../services');
var clients = require('../clients');

describe('localServer', function() {
    it('should no error when regist service', function() {
        localServer.registerService('test', {
            echo: function(msg) {
                if (!msg) {
                    throw Error('no message');
                }
                return 'echo back: ' + msg;
            },
            invokeSay: function(headers, params, callback) {
                var msg = params[0];
                callback(null, 'say back: ' + msg);
            }
        });
        localServer.init();
    });
    it('should call the method after regist the servcie', function(done) {
        services.invoke({
            serviceId: 'test',
            methodName: 'echo',
            params: ['hello']
        }, function(err, response) {
            if (err) {
                done(err);
                return;
            }
            assert.equal('echo back: hello', response);
            done();
        });
    });
    it('async call when there is an invokeSay method', function(done) {
        services.invoke({
            serviceId: 'test',
            methodName: 'say',
            params: ['hello']
        }, function(err, response) {
            if (err) {
                done(err);
                return;
            }
            assert.equal('say back: hello', response);
            done();
        });
    });
    it('no such method', function(done) {
        services.invoke({
            serviceId: 'test',
            methodName: 'speak',
            params: ['hello']
        }, function(err, response) {
            if (!err) {
                done('no error');
                return;
            }
            done();
        });
    });
    it('invoke error', function(done) {
        services.invoke({
            serviceId: 'test',
            methodName: 'echo',
            params: []
        }, function(err, response) {
            if (!err) {
                done('no error');
                return;
            }
            done();
        });
    });
    it('remove ok', function(done) {
        clients.remove(localServer.localClient);
        services.invoke({
            serviceId: 'test',
            methodName: 'echo',
            params: ['hello']
        }, function(err, response) {
            if (!err) {
                done('has no err');
            } else {
                done();
            }
        });
    });
});
