import child_process from 'child_process'

import tap from 'tap'
import File from 'vinyl'
import type { SinonSpy } from 'sinon'
import { spy } from 'sinon'
// @ts-expect-error mock-spawn has no @typings
import mockSpawn from 'mock-spawn'

import which from 'which'
import PluginError from 'plugin-error'

import gulpYarn from '../src'

import pkg from './package.json'

const spawnSandbox = mockSpawn()
const oldSpawn = child_process.spawn
let spawnSpy: SinonSpy

spawnSandbox.sequence.add(spawnSandbox.simple(1))
spawnSandbox.sequence.add(spawnSandbox.simple(0))

tap.before(() => {
  child_process.spawn = spawnSandbox
  spawnSpy = spy(child_process, 'spawn')
})

tap.beforeEach(() => {
  spawnSpy.resetHistory()
})

tap.teardown(() => {
  child_process.spawn = oldSpawn
  spawnSpy.restore()
})

tap.test('handle child_process spawn error', (t) => {
  t.plan(2)

  const file = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn()

  stream.on('error', (err: PluginError) => {
    t.type(err, PluginError)
    t.equal(err.message, 'yarn exited with non-zero code 1.')
  })

  stream.write(file)
  stream.end()
})

tap.test('check child_process spawn args', (t) => {
  const file = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ production: true, ignoreEngines: true })

  const yarnLocation = which.sync('yarn')

  stream.write(file)
  stream.end(() => {
    t.equal(spawnSpy.callCount, 1)
    t.same(spawnSpy.args, [
      [
        `"${yarnLocation}"`,
        [
          '--production',
          '--ignore-engines',
        ],
        {
          stdio: 'inherit',
          shell: true,
          cwd: 'test',
        },
      ],
    ])
    t.end()
  })
})

tap.test('child_process spawn args should not get false options', (t) => {
  const file = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ production: false, ignoreEngines: false, dev: true })

  const yarnLocation = which.sync('yarn')

  stream.write(file)
  stream.end(() => {
    t.equal(spawnSpy.callCount, 1)
    t.same(spawnSpy.args, [
      [
        `"${yarnLocation}"`,
        [
          '--dev',
        ],
        {
          stdio: 'inherit',
          shell: true,
          cwd: 'test',
        },
      ],
    ])
    t.end()
  })
})

