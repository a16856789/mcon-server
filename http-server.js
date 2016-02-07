var express = require('express');
var bodyParser = require('body-parser');
var services = require('./services');
var logger = require('./logger').getLogger('http-server');

httpServer = {
    port: 8124,
    app: null
};

httpServer.init = function() {
    var app = express();
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    app.all('/proxy/invoke', function(req, res) {
        var query = req.query.serviceId ? req.query : req.body;
        var conf = {
            headers: JSON.parse(query.headers || '{}'),
            serviceId: query.serviceId || '',
            methodName: query.methodName || '',
            params: JSON.parse(query.params || '[]')
        };
        services.invoke(conf, function(err, response) {
            var body = {
                success: !err,
                error: err,
                response: response
            };
            res.json(body);
            if (err) {
                logger.error(err);
            }
        });
    });

    app.use(express.static('public'));
    app.get('/', function(req, res) {
        res.redirect('/monitor/mcon.html');
    });

    var port = this.port;
    app.listen(port, function() {
        logger.info('Http Server is Listening at port %d.', port);
    });
};


module.exports = httpServer;
