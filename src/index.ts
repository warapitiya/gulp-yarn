/**
 * Created by Malindu Warapitiya on 10/23/16.
 */

import path from 'node:path'
import { Transform } from 'node:stream'
import type { SpawnOptions } from 'node:child_process'
import { spawn } from 'node:child_process'

import PluginError from 'plugin-error'
import which from 'which'

import type { CommandOptions } from './commands'
import { PLUGIN_NAME, resolveYarnOptions } from './utils'

interface RequiredFile {
  'package.json': {
    cmd: string
    cwd: string
    args: string[]
    spawnOptions: SpawnOptions
  }
}

const requiredFileOpts: RequiredFile = {
  'package.json': {
    cmd: 'yarn',
    cwd: '',
    args: [],
    spawnOptions: {
      stdio: 'inherit',
      shell: true,
    },
  },
}

const gulpYarn = (gulpYarnOptions?: Partial<CommandOptions>) => {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      if (chunk === undefined || chunk === null) {
        // Return empty file
        callback(null, chunk)
        return
      }

      const basePath = path.basename(chunk.path)
      const command = requiredFileOpts[basePath as keyof RequiredFile]

      // If Not specific command
      if (!command) {
        callback()
        return
      }

      const [error, listOfArgs] = resolveYarnOptions(gulpYarnOptions)

      if (error) {
        callback(error)
        return
      }

      command.cwd = path.dirname(chunk.path)
      command.args = listOfArgs
      command.spawnOptions.cwd = command.cwd || process.cwd()

      which(command.cmd)
        .then((commandPath) => {
          const cmd = spawn(
            `"${commandPath}"`,
            command.args,
            command.spawnOptions,
          )

          cmd.once('close', (code) => {
            if (code !== 0) {
              const error = new PluginError(
                PLUGIN_NAME,
                `${command.cmd} exited with non-zero code ${code}.`,
              )
              callback(error)
            }
            else {
              callback(null, chunk)
            }
          })
        }).catch((error) => {
          const catchError = new PluginError(PLUGIN_NAME, error, { showStack: true })
          callback(catchError)
        })
    },
  })
}

// Plugin level function(dealing with files)
export default function (gulpYarnOptions?: Partial<CommandOptions>) {
  // Creating a stream through which each file will pass
  return gulpYarn(gulpYarnOptions)
}
