const fs = require('fs');
module.exports = path => !fs.existsSync(path) && fs.mkdirSync(path, {recursive: true});
