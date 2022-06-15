const path = require('path'),
    fs = require('fs');

module.exports = (filePath, content) => {
    const directoryPath = path.dirname(filePath);
    !fs.existsSync(directoryPath) && fs.mkdirSync(directoryPath, {recursive: true});
    fs.writeFileSync(filePath, content ? `${content}` : '');
};
