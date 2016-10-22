'use strict';
var through2 = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var commandRunner = require('./lib/commandRunner');
var commandList = {
    'package.json': {
        cmd: 'yarn',
        args: []
    }
};

module.exports = function install(opts) {
    var toRun = [];
    var count = 0;

    return through2({
            objectMode: true
        },
        function (file, enc, callback) {
            if (!file.path) {
                callback();
            }
            var cmd = clone(commandList[path.basename(file.path)]);

            if (cmd) {
                if (opts && opts.production) {
                    cmd.args.push('--production');
                }
                if (opts && opts.ignoreScripts) {
                    cmd.args.push('--ignore-scripts');
                }
                if (opts && opts.args) {
                    formatArguments(opts.args).forEach(function (arg) {
                        cmd.args.push(arg);
                    });
                }

                cmd.cwd = path.dirname(file.path);
                toRun.push(cmd);
            }
            this.push(file);
            callback();
        },
        function (callback) {
            if (!toRun.length) {
                return callback();
            }
            if (skipInstall()) {
                log('Skipping install.', 'Run `' + gutil.colors.yellow(formatCommands(toRun)) + '` manually');
                return callback();
            } else {
                toRun.forEach(function (command) {
                    commandRunner.run(command, function (err) {
                        if (err) {
                            log(err.message, ', run `' + gutil.colors.yellow(formatCommand(command)) + '` manually');
                            return callback(err);
                        }
                        done(callback, toRun.length);
                    });
                });
            }
        }
    );

    function done(callback, length) {
        if (++count === length) {
            callback();
        }
    }
};

function log() {
    if (isTest()) {
        return;
    }
    gutil.log.apply(gutil, [].slice.call(arguments));
}

function formatCommands(cmds) {
    return cmds.map(formatCommand).join(' && ');
}

function formatCommand(command) {
    return command.cmd + ' ' + command.args.join(' ');
}

function formatArguments(args) {
    if (Array.isArray(args)) {
        args.forEach(function (arg, index, arr) {
            arr[index] = formatArgument(arg);
        });
        return args;
    } else if (typeof args === 'string' || args instanceof String) {
        return [formatArgument(args)];
    } else {
        log('Arguments are not passed in a valid format: ' + args);
        return [];
    }
}

function formatArgument(arg) {
    var result = arg;
    while (!result.match(/--.*/)) {
        result = '-' + result;
    }
    return result;
}

function skipInstall() {
    return process.argv.slice(2).indexOf('--skip-install') >= 0;
}

function isTest() {
    return process.env.NODE_ENV === 'test';
}

function clone(obj) {
    if (Array.isArray(obj)) {
        return obj.map(clone);
    } else if (typeof obj === 'object') {
        var copy = {};
        Object.keys(obj).forEach(function (key) {
            copy[key] = clone(obj[key]);
        });
        return copy;
    } else {
        return obj;
    }
}
