/**
 * Created by mwarapitiya on 10/23/16.
 */
import path from 'path';
import through2 from 'through2';
import gutil from 'gulp-util';
import commands from './utils/commands';
import commandRunner from './utils/commandRunner';

const commandList = {
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
export default opts => {
    const toRun = [];
    let count = 0;

    return through2({
            objectMode: true
        },
        function (file, enc, callback) {
            const flush = callback => {
                if (!toRun.length) {
                    return callback();
                }
                if (skipInstall()) {
                    log('Skipping yarn.', `Run \`${gutil.colors.yellow(formatCommands(toRun))}\` manually`);
                    return callback();
                }
                toRun.forEach(command => {
                    commandRunner.run(command, err => {
                        if (err) {
                            log(err.message, `, run \`${gutil.colors.yellow(formatCommand(command))}\` manually`);
                            return callback(err);
                        }
                        done(callback, toRun.length);
                    });
                });
            };

            if (!file.path) {
                callback();
            }
            const cmd = clone(commandList[path.basename(file.path)]);

            if (cmd) {
                if (opts) {
                    for (const key in opts) {
                        if (commands.hasOwnProperty(key) && opts[key] === true) {
                            cmd.args.push(commands[key]);
                        } else {
                            if (key === 'args') {
                                continue;
                            }
                            log('Warning!.', `Command \`${gutil.colors.yellow(key)}\` not supported by gulp-yarn.`);
                            return callback(new Error('Command not supported.'));
                        }
                    }

                    if (opts.args) {
                        formatArguments(opts.args).forEach(arg => {
                            cmd.args.push(arg);
                        });
                    }
                }

                cmd.cwd = path.dirname(file.path);
                toRun.push(cmd);
            }
            this.push(file);
            flush(callback);
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
    gutil.log(...[].slice.call(arguments));
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
    return `${command.cmd} ${command.args.join(' ')}`;
}

/**
 * Formant Arguments
 * @param args
 * @returns {*}
 */
function formatArguments(args) {
    if (Array.isArray(args)) {
        args.forEach((arg, index, arr) => {
            arr[index] = formatArgument(arg);
        });
        return args;
    } else if (typeof args === 'string' || args instanceof String) {
        return [formatArgument(args)];
    }
    log(`Arguments are not passed in a valid format: ${args}`);
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
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = clone(obj[key]);
        });
        return copy;
    }
    return obj;
}
