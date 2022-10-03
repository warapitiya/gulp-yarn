/**
 * Created by Malindu Warapitiya on 1/10/22.
 */
import PluginError from 'plugin-error'

import type { CommandOptions } from './commands'
import { Commands } from './commands'

type ErrorOrNull = PluginError | null

export const PLUGIN_NAME = 'gulpYarn'

/**
 * Format argument with double dashes in-front
 * @param args string
 */
export const formatArgument = (args: string): string => {
  const arg = args.trim().replace(/\s\s+/g, ' ').split(/\s/)
  return arg.map((l) => {
    let result = l
    while (!/--.*/.test(result))
      result = `-${result}`

    return result
  }).join(' ')
}

/**
 * Formant multiple arguments
 * @param args string[] | string
 * @returns {*}
 */
export const formatArguments = (args: string[] | string): string[] => {
  if (Array.isArray(args))
    return args.map(item => formatArgument(item))

  return [formatArgument(args)]
}

/**
 * Resolve Options passed to plugin
 * @param gulpYarnOptions
 */
export const resolveYarnOptions = (gulpYarnOptions?: Partial<CommandOptions>): [ErrorOrNull, string[]] => {
  if (gulpYarnOptions) {
    let error = null
    const listOfCommands: string[] = []
    const { args, ...otherOptions } = gulpYarnOptions

    for (const [key, value] of Object.entries(otherOptions)) {
      if (key in Commands) {
        if (value === true) {
          const _command = Commands[key as keyof typeof Commands]
          listOfCommands.push(_command)
        }
      }
      else {
        const msg = `'${key}' option is not supported by the plugin. Please use 'args' option.`
        error = new PluginError(PLUGIN_NAME, msg)
        return [error, []]
      }
    }

    if (!args)
      return [null, listOfCommands]

    if (Array.isArray(args) || typeof args === 'string') {
      const formattedArgs = formatArguments(args)
      listOfCommands.push(...formattedArgs)
      return [null, listOfCommands]
    }
    else {
      const error = new PluginError(PLUGIN_NAME, '\'Args" option is not in valid type.')
      return [error, []]
    }
  }
  return [null, []]
}
