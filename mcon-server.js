var logger = require('./logger').getLogger('startup')

require('./local-services');
require('./local-server').init();
require('./ws-server').init();
require('./http-server').init();
