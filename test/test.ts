import { EventEmitter } from 'node:events';

import tap from 'tap';
import File from 'vinyl';

import { formatArgument, formatArguments, resolveYarnOptions } from '../src/utils';
import { CommandOptions } from '../src/commands';

import pkg from './package.json';

const stdout = new EventEmitter();
const stderr = new EventEmitter();
const spawn = new EventEmitter();

const child_process = {
  spawn: () => spawn,
  stdout,
  stderr,
};

const gulpYarn = tap.mock('../src', {
  'child_process': child_process,
});

tap.test('should warn when sending not supported args', (t) => {
  t.plan(1);
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });
  const gulpYarnObject = gulpYarn({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    npm: true,
  });

  gulpYarnObject.once('error', (error: Error) => {
    t.equal(error.message, `'npm' option is not supported by the plugin. Please use 'args' option.`);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});

tap.test('should run with supported args', t => {
  t.plan(1);
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn({
    production: true,
  });

  gulpYarnObject.once('data', (file: File) => {
    t.equal(file.isBuffer(), true);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});

tap.test('should not call two times', t => {
  t.plan(1);
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  const fakeJSFile = new File({
    base: 'package',
    path: 'test/package.js',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn({
    production: true,
  });

  gulpYarnObject.once('data', (file: File) => {
    t.equal(file.isBuffer(), true);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeJSFile);
  gulpYarnObject.write(fakeFile);
});

tap.test('should run without any arg', t => {
  t.plan(1);
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn();

  gulpYarnObject.once('data', (file: File) => {
    t.equal(file.isBuffer(), true);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});

tap.test('should not run with empty file', t => {
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn({
    production: true,
  });

  // wait for the file to come back out
  gulpYarnObject.once('data', (file: File) => {
    // make sure it came out the same way it went in
    t.equal(file.isBuffer(), false);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});

tap.test(`should run with args as array`, t => {
  t.plan(1);
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn({
    args: ['--production', '--no-bin-links'],
  });

  // wait for the file to come back out
  gulpYarnObject.once('data', (file: File) => {
    // make sure it came out the same way it went in
    t.equal(file.isBuffer(), true);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});

tap.test(`should run with args as string`, t => {
  t.plan(1);
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn({
    args: '--production --no-bin-links',
  });

  // wait for the file to come back out
  gulpYarnObject.once('data', (file: File) => {
    // make sure it came out the same way it went in
    t.equal(file.isBuffer(), true);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});

tap.test('formatArgument()', t => {
  t.plan(8);
  t.equal(formatArgument('production'), '--production');
  t.equal(formatArgument('--production'), '--production');
  t.equal(formatArgument('-production'), '--production');
  t.equal(formatArgument('production --nice-work'), '--production --nice-work');
  t.equal(formatArgument('--production nice-work'), '--production --nice-work');
  t.equal(formatArgument('--production -nice-work'), '--production --nice-work');
  t.equal(formatArgument('--production     --nice-work'), '--production --nice-work');
  t.equal(formatArgument('--production     -nice-work'), '--production --nice-work');
  t.end();
});

tap.test('formatArguments()', t => {
  t.plan(9);
  t.same(formatArguments(['production']), ['--production']);
  t.same(formatArguments(['--production']), ['--production']);
  t.same(formatArguments(['-production']), ['--production']);
  t.same(formatArguments(['production', '--nice-work']), ['--production', '--nice-work']);
  t.same(formatArguments(['--production', 'nice-work']), ['--production', '--nice-work']);
  t.same(formatArguments(['--production', '-nice-work']), ['--production', '--nice-work']);
  t.same(formatArguments(['--production', '    --nice-work']), ['--production', '--nice-work']);
  t.same(formatArguments(['--production', '    -nice-work']), ['--production', '--nice-work']);
  t.same(formatArguments('--production    -nice-work'), ['--production --nice-work']);
  t.end();
});

tap.test('resolveYarnOptions()', t => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let [error] = resolveYarnOptions({ test: true });
  t.equal(error?.message, `'test' option is not supported by the plugin. Please use 'args' option.`);

  let [arg1, arg2] = resolveYarnOptions({ dev: true } as CommandOptions);
  t.equal(arg1, null);
  t.same(arg2, ['--dev']);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [error] = resolveYarnOptions({ args: {} });
  t.equal(error?.message, `'Args" option is not in valid type.`);

  [arg1, arg2] = resolveYarnOptions({ args: ['done'] } as CommandOptions);
  t.equal(arg1, null);
  t.same(arg2, ['--done']);

  [arg1, arg2] = resolveYarnOptions({ force: true, args: ['done'] } as CommandOptions);
  t.equal(arg1, null);
  t.same(arg2, ['--force', '--done']);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [arg1, arg2] = resolveYarnOptions();
  t.equal(arg1, null);
  t.same(arg2, []);
  t.end();
});

tap.test(`args should start with dashes`, t => {
  t.plan(1);
  // create the fake file
  const fakeFile = new File({
    base: 'package',
    path: 'test/package.json',
    contents: Buffer.from(JSON.stringify(pkg)),
  });

  // Create a gulpYarn plugin stream
  const gulpYarnObject = gulpYarn({
    args: 'production --no-bin-links',
  });

  // wait for the file to come back out
  gulpYarnObject.once('data', (file: File) => {
    t.equal(file.isBuffer(), true);
    t.end();
  });

  // write the fake file to it
  gulpYarnObject.write(fakeFile);
});
