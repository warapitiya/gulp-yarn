import child_process from 'child_process'

import tap from 'tap'
import File from 'vinyl'
import type { SinonSpy } from 'sinon'
import { spy } from 'sinon'
// @ts-expect-error mock-spawn has no @typings
import mockSpawn from 'mock-spawn'

import gulpYarn from '../src'

import pkg from './package.json'

const spawnSandbox = mockSpawn()
const oldSpawn = child_process.spawn
let spawnSpy: SinonSpy

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
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should run with supported args', (t) => {
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

tap.test('should run with false supported args', (t) => {
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ production: false })

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

  const dataSpy = spy()
  const errorSpy = spy()
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

  const errorSpy = spy()
  stream.on('error', errorSpy)

  stream.on('data', (file: File) => {
    t.equal(file.isBuffer(), true)
  })

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
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

  const errorSpy = spy()
  stream.on('error', errorSpy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), false)
  })

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('should not run for undefined buffers', (t) => {
  t.plan(2)
  const stream = gulpYarn({ production: true })

  const errorSpy = spy()
  const dataSpy = spy()
  stream.on('error', errorSpy)
  stream.on('data', dataSpy)

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
    t.equal(dataSpy.notCalled, true)
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

  const errorSpy = spy()
  stream.on('error', errorSpy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), true)
  })

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
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

  const errorSpy = spy()
  stream.on('error', errorSpy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), true)
  })

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
  })

  stream.write(fakeFile)
  stream.end()
})

tap.test('args should start with dashes', (t) => {
  t.plan(2)

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn({ args: 'production --no-bin-links' })

  const errorSpy = spy()
  stream.on('error', errorSpy)

  stream.once('data', (file: File) => {
    t.equal(file.isBuffer(), true)
  })

  stream.on('end', () => {
    t.equal(errorSpy.notCalled, true)
  })

  stream.write(fakeFile)
  stream.end()
})

