import child_process from 'child_process'
import tap from 'tap'
import File from 'vinyl'
import type { SinonSpy } from 'sinon'
import sinon from 'sinon'
// @ts-expect-error mock-spawn has no @typings
import mockSpawn from 'mock-spawn'

import which from 'which'
import PluginError from 'plugin-error'
import { formatArgument, formatArguments, resolveYarnOptions } from '../src/utils'
import gulpYarn from '../src'

import pkg from './package.json'

const spawnSandbox = mockSpawn()
const oldSpawn = child_process.spawn
let spawnSpy: SinonSpy

tap.before(() => {
  child_process.spawn = spawnSandbox
  spawnSpy = sinon.spy(child_process, 'spawn')
})

tap.beforeEach(() => {
  spawnSpy.resetHistory()
})

// tap.afterEach(() => {
//   sinon.restore()
// })

tap.teardown(() => {
  child_process.spawn = oldSpawn
  spawnSpy.restore()
})

tap.test('should warn when sending not supported args', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })
  // @ts-expect-error passing invalid prop for unit testing purpose
  const stream = gulpYarn({ npm: true })

  stream.once('error', (error: Error) => {
    t.type(error, Error)
    t.equal(error.message, '\'npm\' option is not supported by the plugin. Please use \'args\' option.')
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should run with supported args', (t) => {
  t.plan(1)
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ production: true })

  stream.on('data', (file: File) => {
    t.equal(file.isBuffer(), true)
  })

  stream.on('end', () => {
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should not call two times', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const fakeJSFile = new File({
    base: 'package',
    path: 'test/package.js',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ production: true })

  const dataSpy = sinon.spy()
  const errorSpy = sinon.spy()
  stream.on('data', dataSpy)
  stream.on('error', errorSpy)

  stream.on('end', () => {
    t.equal(dataSpy.callCount, 1)
    t.equal(errorSpy.notCalled, true)
    t.end()
  })

  stream.write(fakeJSFile)
  stream.write(fakeFile)
  stream.end()
})

tap.test('should run without any arg', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn()

  const spy = sinon.spy()
  stream.on('error', spy)

  stream.on('data', (file: File) => {
    t.equal(file.isBuffer(), true)
  })

  stream.on('end', () => {
    t.equal(spy.notCalled, true)
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should not run with empty file', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: undefined,
  })

  const stream = gulpYarn({ production: true })

  const spy = sinon.spy()
  stream.on('error', spy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), false)
  })

  stream.on('end', () => {
    t.equal(spy.notCalled, true)
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should not run for undefined buffers', (t) => {
  t.plan(2)
  const stream = gulpYarn({ production: true })

  const errorSpy = sinon.spy()
  const dataSpy = sinon.spy()
  stream.on('error', errorSpy)
  stream.on('data', dataSpy)

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
    t.equal(dataSpy.notCalled, true)
    t.end()
  })

  stream.write(undefined)
  stream.end()
})

tap.test('should run with args as array', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ args: ['--production', '--no-bin-links'] })

  const spy = sinon.spy()
  stream.on('error', spy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), true)
    t.equal(spy.notCalled, true)
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should run with args as string', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ args: '--production --no-bin-links' })

  const spy = sinon.spy()
  stream.on('error', spy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), true)
    t.equal(spy.notCalled, true)
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('formatArgument() returns formatted argument', (t) => {
  t.plan(8)
  t.equal(formatArgument('production'), '--production')
  t.equal(formatArgument('--production'), '--production')
  t.equal(formatArgument('-production'), '--production')
  t.equal(formatArgument('production --nice-work'), '--production --nice-work')
  t.equal(formatArgument('--production nice-work'), '--production --nice-work')
  t.equal(formatArgument('--production -nice-work'), '--production --nice-work')
  t.equal(formatArgument('--production     --nice-work'), '--production --nice-work')
  t.equal(formatArgument('--production     -nice-work'), '--production --nice-work')
  t.end()
})

tap.test('formatArguments() returns formatted arguments', (t) => {
  t.plan(9)
  t.same(formatArguments(['production']), ['--production'])
  t.same(formatArguments(['--production']), ['--production'])
  t.same(formatArguments(['-production']), ['--production'])
  t.same(formatArguments(['production', '--nice-work']), ['--production', '--nice-work'])
  t.same(formatArguments(['--production', 'nice-work']), ['--production', '--nice-work'])
  t.same(formatArguments(['--production', '-nice-work']), ['--production', '--nice-work'])
  t.same(formatArguments(['--production', '    --nice-work']), ['--production', '--nice-work'])
  t.same(formatArguments(['--production', '    -nice-work']), ['--production', '--nice-work'])
  t.same(formatArguments('--production    -nice-work'), ['--production --nice-work'])
  t.end()
})

tap.test('resolveYarnOptions()', (t) => {
  // @ts-expect-error Unit testing purpose passing invalid property
  let [error] = resolveYarnOptions({ test: true })
  t.equal(error?.message, '\'test\' option is not supported by the plugin. Please use \'args\' option.')

  let [arg1, arg2] = resolveYarnOptions({ dev: true })
  t.equal(arg1, null)
  t.same(arg2, ['--dev']);

  // @ts-expect-error Unit testing purpose
  [error] = resolveYarnOptions({ args: {} })
  t.equal(error?.message, '"Args" option is not in valid type.');

  [arg1, arg2] = resolveYarnOptions({ args: ['done'] })
  t.equal(arg1, null)
  t.same(arg2, ['--done']);

  [arg1, arg2] = resolveYarnOptions({ force: true, args: ['done'] })
  t.equal(arg1, null)
  t.same(arg2, ['--force', '--done']);

  [arg1, arg2] = resolveYarnOptions()
  t.equal(arg1, null)
  t.same(arg2, [])
  t.end()
})

tap.test('args should start with dashes', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ args: 'production --no-bin-links' })

  const spy = sinon.spy()
  stream.on('error', spy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), true)
    t.equal(spy.notCalled, true)
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('handle "which" module error', (t) => {
  t.plan(2)
  sinon.stub(which, 'sync').throws(new Error('Unit testing error'))

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn()

  stream.on('error', (err: Error) => {
    t.type(err, PluginError)
    t.equal(err.message, 'Unit testing error')
    t.end()
  })

  stream.write(fakeFile)
  stream.end()
})

