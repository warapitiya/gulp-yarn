/**
 * Created by mwarapitiya on 10/23/16.
 */

var which = require('which');
var childProcess = require('child_process');

exports.run = function run(command, callback) {
    which(command.cmd, function (err, cmdpath) {
        if (err) {
            callback(new Error('Can\'t yarn! `' + command.cmd + '` doesn\'t seem to be installed.'));
            return;
        }
        var cmd = childProcess.spawn(cmdpath, command.args, {stdio: 'inherit', cwd: command.cwd || process.cwd()});
        cmd.on('close', function (code) {
            if (code !== 0) {
                return callback(new Error(command.cmd + ' exited with non-zero code ' + code));
            }
            callback();
        });
    });
};
