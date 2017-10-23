/**
 * Created by mwarapitiya on 10/23/16.
 */

const path = require('path');
const childProcess = require('child_process');
const through = require('through2');
const gutil = require('gulp-util');
const which = require('which');
const mapSeries = require('async/mapSeries');
const yarnArgs = require('./utils/commands');
const PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulpYarn';

const commandList = {
    'package.json': {
        cmd: 'yarn',
        args: []
    }
};

// Plugin level function(dealing with files)
function gulpYarn(gulpYarnOptions) {
    const toRun = [];
    let count = 0;

    // Creating a stream through which each file will pass
    return through.obj((file, enc, callback) => {
        if (file === undefined || file.isNull()) {
            // return empty file
            return callback(null, file);
        }

        // flush function
        const flush = (err, file) => {
            if (err) {
                return callback(err);
            }
            return callback(null, file);
        };

        const command = clone(commandList[path.basename(file.path)]);

        if (command) {
            if (gulpYarnOptions) {
                let error = undefined;
                command.args = Object.keys(gulpYarnOptions)
                    .map((key) => {
                        if (yarnArgs.hasOwnProperty(key) && gulpYarnOptions[key] === true) {
                            return yarnArgs[key];
                        } else {
                            if (key !== 'args') {
                                error = new PluginError(PLUGIN_NAME, `Command '${key}' not supported.`);
                            }
                        }
                    })
                    .filter((item) => item !== undefined || item === null);

                if (error) {
                    return flush(error);
                }
            }
            if (gulpYarnOptions && gulpYarnOptions.args) {
                command.args = flatten(command.args.concat(formatArguments(gulpYarnOptions.args)));
            }
            command.cwd = path.dirname(file.path);
            toRun.push(command);
        }

        if (!toRun.length) {
            callback(new PluginError(PLUGIN_NAME, `No commands found to run.`));
        }

        return mapSeries(toRun, (singleCommand, next) => {
            which(singleCommand.cmd, (err, cmdpath) => {
                if (err) {
                    next(new PluginError(PLUGIN_NAME, `Error while determining the folder path.`));
                }
                const cmd = childProcess.spawn(cmdpath, singleCommand.args, {
                    stdio: 'inherit',
                    cwd: singleCommand.cwd || process.cwd()
                });
                cmd.once('close', (code) => {
                    if (code !== 0) {
                        next(new PluginError(PLUGIN_NAME, `${command.cmd} exited with non-zero code ${code}.`));
                    } else {
                        // If all commands are finished
                        if (toRun.length === ++count) {
                            next(false, file);
                        }
                    }
                });
            });
        }, (err, file) => {
            if (err) {
                flush(err);
            }
            flush(null, file[0]);
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
        const copy = {};
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
    let result = arg;
    while (!result.match(/--.*/)) {
        result = `-${result}`;
    }
    return result;
}

// Exporting the plugin main function
module.exports = gulpYarn;
