/* jshint camelcase: false, strict: false */
/* global describe, beforeEach, it */

var chai = require('chai'),
    should = chai.should(),
    util = require('util'),
    gutil = require('gulp-util'),
    path = require('path'),
    commandRunner = require('../lib/commandRunner'),
    install = require('../.'),
    args = process.argv.slice();

function fixture (file) {
  var filepath = path.join(__dirname, file);
  return new gutil.File({
    path: filepath,
    cwd: __dirname,
    base: path.join(__dirname, path.dirname(file)),
    contents: null
  });
}

var originalRun;

describe('gulp-yarn', function () {
  beforeEach(function () {
    originalRun = commandRunner.run;
    commandRunner.run = mockRunner();
    process.argv = args;
  });

  afterEach(function () {
    commandRunner.run = originalRun;
  });

  it('should run `yarn install` if stream contains `package.json`', function (done) {
    var file = fixture('package.json');

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('yarn');
      commandRunner.run.commands[0].args.should.eql(['install']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --production` if stream contains `package.json` and `production` option is set', function (done) {
    var file = fixture('package.json');

    var stream = install({production:true});

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('yarn');
      commandRunner.run.commands[0].args.should.eql(['install', '--production']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `yarn install --ignore-scripts` if stream contains `package.json` and `ignoreScripts` option is set', function (done) {
    var file = fixture('package.json');

    var stream = install({ignoreScripts:true});

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('yarn');
      commandRunner.run.commands[0].args.should.eql(['install', '--ignore-scripts']);
      done();
    });

    stream.write(file);

    stream.end();
  });
});

function mockRunner () {
  var mock = function mock (cmd, cb) {
    mock.called += 1;
    mock.commands.push(cmd);
    cb();
  };
  mock.called = 0;
  mock.commands = [];
  return mock;
}
