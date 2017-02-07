/**
 * Created by mwarapitiya on 10/23/16.
 */

'use strict';
var path = require('path');
var through2 = require('through2');
var gutil = require('gulp-util');
var commands = require('./lib/commands');
var commandRunner = require('./lib/commandRunner');

var commandList = {
    'package.json': {
        cmd: 'yarn',
        args: []
    }
};

/**
 * Install
 * @param opts
 * @returns {*}
 */
module.exports = function (opts) {
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
                if (opts) {
                    for (var key in opts) {
                        if (commands.hasOwnProperty(key)) {
                            cmd.args.push(commands[key]);
                        } else {
                            log('Warning!.', 'Command `' + gutil.colors.yellow(key) + '` not supported by' +
                                ' gulp-yarn.');
                            return callback(new Error('Command not supported.'));
                        }
                    }
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
                log('Skipping yarn.', 'Run `' + gutil.colors.yellow(formatCommands(toRun)) + '` manually');
                return callback();
            }
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
    );

    function done(callback, length) {
        if (++count === length) {
            callback();
        }
    }
};

/**
 * Logger
 */
function log() {
    if (isTest()) {
        return;
    }
    gutil.log.apply(gutil, [].slice.call(arguments));
}

/**
 * Format commands
 */
function formatCommands(cmds) {
    return cmds.map(formatCommand).join(' && ');
}

/**
 * Format command
 * @param command
 * @returns {string}
 */
function formatCommand(command) {
    return command.cmd + ' ' + command.args.join(' ');
}

/**
 * Formant Arguments
 * @param args
 * @returns {*}
 */
function formatArguments(args) {
    if (Array.isArray(args)) {
        args.forEach(function (arg, index, arr) {
            arr[index] = formatArgument(arg);
        });
        return args;
    } else if (typeof args === 'string' || args instanceof String) {
        return [formatArgument(args)];
    }
    log('Arguments are not passed in a valid format: ' + args);
    return [];
}

/**
 * Format argument
 * @param arg
 * @returns {*}
 */
function formatArgument(arg) {
    var result = arg;
    while (!result.match(/--.*/)) {
        result = '-' + result;
    }
    return result;
}

/**
 * Skip
 * @returns {boolean}
 */
function skipInstall() {
    return process.argv.slice(2).indexOf('--skip-yarn') >= 0;
}

/**
 * is Test environment
 * @returns {boolean}
 */
function isTest() {
    return process.env.NODE_ENV === 'test';
}

/**
 * clone object
 * @param obj
 * @returns {*}
 */
function clone(obj) {
    if (Array.isArray(obj)) {
        return obj.map(clone);
    } else if (typeof obj === 'object') {
        var copy = {};
        Object.keys(obj).forEach(function (key) {
            copy[key] = clone(obj[key]);
        });
        return copy;
    }
    return obj;
}
