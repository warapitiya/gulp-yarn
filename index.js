/**
 * Created by mwarapitiya on 10/23/16.
 */

var path = require('path');
var childProcess = require('child_process');
var through = require('through2');
var gutil = require('gulp-util');
var which = require('which');
var yarnArgs = require('./utils/commands');
var PluginError = gutil.PluginError;

// Consts
var PLUGIN_NAME = 'gulpYarn';

var commandList = {
    'package.json': {
        cmd: 'yarn',
        args: []
    }
};

// Plugin level function(dealing with files)
function gulpYarn(gulpYarnOptions) {
    var toRun = [];
    var count = 0;

    // Creating a stream through which each file will pass
    return through.obj((file, enc, cb) => {
        if (file === undefined || file.isNull()) {
            // return empty file
            return cb(null, file);
        }

        var command = clone(commandList[path.basename(file.path)]);

        if (command) {
            if (gulpYarnOptions) {
                command.args = Object.keys(gulpYarnOptions)
                    .map((key) => {
                        if (yarnArgs.hasOwnProperty(key) && gulpYarnOptions[key] === true) {
                            return yarnArgs[key];
                        } else {
                            if (key !== 'args') {
                                cb(new PluginError(PLUGIN_NAME, `Command '${key}' not supported.`));
                            }
                        }
                    })
                    .filter((item) => item !== undefined || item === null);
            }
            if (gulpYarnOptions && gulpYarnOptions.has) {
                command.args = flatten(command.args.concat(formatArguments(gulpYarnOptions.args)));
            }
            command.cwd = path.dirname(file.path);
            toRun.push(command);
        }

        if (!toRun.length) {
            cb(new PluginError(PLUGIN_NAME, `No commands found to run.`));
        }

        toRun.map((singleCommand) => {
            which(singleCommand.cmd, (err, cmdpath) => {
                if (err) {
                    cb(new PluginError(PLUGIN_NAME, `Error while determining the folder path.`));
                    return;
                }
                var cmd = childProcess.spawn(cmdpath, singleCommand.args, {
                    stdio: 'inherit',
                    cwd: singleCommand.cwd || process.cwd()
                });
                cmd.on('close', code => {
                    if (code !== 0) {
                        cb(new PluginError(PLUGIN_NAME, `${command.cmd} exited with non-zero code ${code}.`));
                    }

                    // If all commands are finished
                    if (++count === toRun.length) {
                        cb(null, file);
                    }
                });
            });
        });
    });
}

/**
 * Clone object
 * @param obj
 * @returns {*}
 */
function clone(obj) {
    if (Array.isArray(obj)) {
        return obj.map(clone);
    } else if (typeof obj === 'object') {
        var copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = clone(obj[key]);
        });
        return copy;
    }
    return obj;
}

/**
 * Flatten deep arrays
 * @param arr
 * @returns {*}
 */
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

/**
 * Formant Arguments
 * @param args
 * @returns {*}
 */
function formatArguments(args) {
    if (Array.isArray(args)) {
        return args.map((item) => formatArgument(item));
    } else if (typeof args === 'string' || args instanceof String) {
        return [formatArgument(args)];
    }
    console.error(`${PLUGIN_NAME} : Arguments are not passed in a valid format: ${args}`);
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
        result = `-${result}`;
    }
    return result;
}

// Exporting the plugin main function
module.exports = gulpYarn;
