var exec = require('cordova/exec');

exports.applyFilter = function(arg0, success, error) {
    exec(success, error, "ImageFilterPlugin", "applyFilter", [arg0]);
};
