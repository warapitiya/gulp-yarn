/**
 * Created by Malindu Warapitiya on 10/23/16.
 */

import path from 'node:path';
import { Transform } from 'node:stream';
import { spawn, SpawnOptions } from 'node:child_process';

import PluginError from 'plugin-error';
import which from 'which';

import { CommandOptions } from './commands';
import { PLUGIN_NAME, resolveYarnOptions } from './utils';

interface ICommandOptions {
  'package.json': {
    cmd: string;
    cwd: string;
    args: string[];
    spawnOptions: SpawnOptions;
  };
}

const CommandOptions: ICommandOptions = {
  'package.json': {
    cmd: 'yarn',
    cwd: '',
    args: [],
    spawnOptions: {
      stdio: 'inherit',
      shell: true,
    },
  },
};

const gulpYarn = (gulpYarnOptions: CommandOptions) => {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      if (chunk === undefined || chunk === null) {
        // Return empty file
        return callback(null, chunk);
      }

      const basePath = path.basename(chunk.path);
      const command = CommandOptions[basePath as keyof ICommandOptions];

      // If Not specific command
      if (!command) {
        return callback();
      }

      const [error, listOfArgs] = resolveYarnOptions(gulpYarnOptions);

      if (error) {
        return callback(error);
      }

      command.cwd = path.dirname(chunk.path);
      command.args = listOfArgs;
      command.spawnOptions.cwd = command.cwd || process.cwd();

      which(command.cmd)
        .then((commandPath) => {

          const cmd = spawn(
            `"${commandPath}"`,
            command.args,
            command.spawnOptions,
          );

          cmd.once('close', (code) => {
            if (code !== 0) {
              const error = new PluginError(
                PLUGIN_NAME,
                `${command.cmd} exited with non-zero code ${code}.`,
              );
              return callback(error);
            } else {
              return callback(null, chunk);
            }
          });
        }).catch((error) => {
        const catchError = new PluginError(PLUGIN_NAME, error, { showStack: true });
        return callback(catchError);
      });
    },
  });
};


// Plugin level function(dealing with files)
module.exports = (gulpYarnOptions: CommandOptions) => {
  // Creating a stream through which each file will pass
  return gulpYarn(gulpYarnOptions);
};
