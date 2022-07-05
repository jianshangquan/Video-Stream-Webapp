const fs = require('fs');

module.exports = {
    getDirectories: (path) => {
        return fs.readdirSync(path).filter(function (file) {
            return fs.statSync(path+'/'+file).isDirectory();
        });
    },
    getFiles: (path) => {
        return fs.readdirSync(path).filter(function (file) {
            return !fs.statSync(path+'/'+file).isDirectory();
        });
    }
}