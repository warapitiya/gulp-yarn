/**
 * Created by Malindu Warapitiya on 10/23/16.
 */

const path = require('path');
const childProcess = require('child_process');
const through = require('through2');
const which = require('which');
const mapSeries = require('async/mapSeries');
const PluginError = require('plugin-error');
const clone = require('clone');
const yarnArgs = require('./utils/commands');

// Constants
const PLUGIN_NAME = 'gulpYarn';

const commandList = {
  'package.json': {
    cmd: 'yarn',
    args: [],
  },
};

/**
 * Flatten deep arrays
 * @returns {*}
 * @param array
 */
function flatten(array) {
  return array.reduce(
    (flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
    []
  );
}

/**
 * Format argument
 * @param arg
 * @returns {*}
 */
function formatArgument(arg) {
  let result = arg;
  while (!/--.*/.test(result)) {
    result = `-${result}`;
  }

  return result;
}

/**
 * Formant Arguments
 * @param args
 * @returns {*}
 */
function formatArguments(args) {
  if (Array.isArray(args)) {
    return args.map((item) => formatArgument(item));
  }

  if (typeof args === 'string' || args instanceof String) {
    return [formatArgument(args)];
  }

  console.error(`${PLUGIN_NAME} : Arguments are not passed in a valid format: ${args}`);
  return [];
}

// Plugin level function(dealing with files)
function gulpYarn(gulpYarnOptions) {
  const toRun = [];
  let count = 0;

  // Creating a stream through which each file will pass
  return through.obj((file, enc, callback) => {
    if (file === undefined || file.isNull()) {
      // Return empty file
      return callback(null, file);
    }

    const command = clone(commandList[path.basename(file.path)]);
    if (command !== undefined) {
      if (gulpYarnOptions) {
        let error = null;
        const { args, ...otherOptions } = gulpYarnOptions;

        for (const [key, value] of Object.entries(otherOptions)) {
          if (Object.prototype.hasOwnProperty.call(yarnArgs, key) && value === true) {
            command.args.push(yarnArgs[key]);
          } else {
            error = new PluginError(PLUGIN_NAME, `Command '${key}' not supported.`);
            break;
          }
        }

        if (error) {
          return callback(error);
        }
      }

      if (gulpYarnOptions && gulpYarnOptions.args) {
        command.args = flatten(command.args.concat(formatArguments(gulpYarnOptions.args)));
      }

      command.cwd = path.dirname(file.path);
      toRun.push(command);

      if (toRun.length === 0) {
        callback(new PluginError(PLUGIN_NAME, 'No commands found to run.'));
      }

      return mapSeries(
        toRun,
        (singleCommand, next) => {
          which(singleCommand.cmd)
            .then((commandPath) => {
              const installOptions = {
                stdio: 'inherit',
                shell: true,
                cwd: singleCommand.cwd || process.cwd(),
              };
              const cmd = childProcess.spawn(
                `"${commandPath}"`,
                singleCommand.args,
                installOptions
              );
              cmd.once('close', (code) => {
                if (code !== 0) {
                  next(
                    new PluginError(
                      PLUGIN_NAME,
                      `${command.cmd} exited with non-zero code ${code}.`
                    )
                  );
                } else {
                  next();
                }
              });
            })
            .catch(() => {
              next(new PluginError(PLUGIN_NAME, 'Error while determining the folder path.'));
            });
        },
        (_error) => {
          if (_error) {
            return callback(_error);
          }

          return callback(null, file);
        }
      );
    }

    return callback();
  });
}

// Exporting the plugin main function
module.exports = gulpYarn;
