import tap from 'tap'
import { stub } from 'sinon'
import which from 'which'
import File from 'vinyl'
import PluginError from 'plugin-error'

import gulpYarn from '../src'

import pkg from './package.json'

tap.test('handle "which" module error flow', (t) => {
  t.plan(2)
  stub(which, 'sync').throws(new Error('Unit testing error'))

  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  })

  const stream = gulpYarn()

  stream.on('error', (err: Error) => {
    t.type(err, PluginError)
    t.equal(err.message, 'Unit testing error')
  })

  stream.write(fakeFile)
  stream.end()
})
