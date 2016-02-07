var log4js = require('log4js');
var fs = require('fs');

/*
 * Init log4js conf
 */
if (log4js) {
	var logPath = process.env.HOME + '/.mcond-logs';
	if (!fs.existsSync(logPath))  fs.mkdirSync(logPath);
	log4js.configure({
		appenders: [{
			type: 'file',
			filename: logPath + '/mcon-default.log',
			maxLogSize: 1 * 1024 * 1024,
			backups: 10
		}, {
            type: "console"
        }]
	});
}

/*
 * Init logger
 */
var logger = log4js.getLogger('mcon-default');
logger.getLogger = function(name) {
    return log4js.getLogger(name);
}

/*
 * Exports
 */
module.exports = logger;
