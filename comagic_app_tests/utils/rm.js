const fs = require('fs');

module.exports = (...paths) => paths.forEach(path => (fs.existsSync(path) && (
    fs.lstatSync(path).isDirectory() ? fs.rmdirSync(path, {recursive: true}) : fs.unlinkSync(path)
)));
