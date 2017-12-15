'use strict';

/**
 * Created by mwarapitiya on 10/18/17.
 */

var childProcess = require('child_process');
var chai = require('chai');
var File = require('vinyl');
var mockSpawn = require('mock-spawn');
var gulpYarn = require('../index');
var expect = chai.expect;
var should = chai.should();
var pkg = require('./package.json');
var sandbox = void 0;

describe('gulpYarn', function () {

    beforeEach(function (done) {
        sandbox = mockSpawn();
        childProcess.spawn = sandbox;
        sandbox.setDefault(sandbox.simple(0, 'sandbox content'));
        done();
    });

    afterEach(function (done) {
        sandbox = null;
        done();
    });

    it('should warn when sending not supported args', function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn({
            npm: true
        });

        gulpYarnObject.once('error', function (error) {
            // check child process calls
            expect(sandbox.calls.length).to.be.equal(0);

            // check error message
            expect(error).to.exist.and.be.instanceof(Error).and.have.property('message', 'Command \'npm\' not supported.');
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it('should run with supported args', function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn({
            production: true
        });

        gulpYarnObject.once('data', function (file) {
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it('should not call two times', function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        var fakeJSFile = new File({
            base: "package",
            path: "test/package.js",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn({
            production: true
        });

        gulpYarnObject.once('data', function (file) {
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeJSFile);
        gulpYarnObject.write(fakeFile);
    });

    it('should run without any arg', function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn();

        gulpYarnObject.once('data', function (file) {
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it('should not run with empty file', function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json"
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn({
            production: true
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', function (file) {
            // make sure it came out the same way it went in
            should.exist(file.isBuffer());
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it(`should run with args as array`, function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn({
            args: ['--production', '--no-bin-links']
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', function (file) {
            // make sure it came out the same way it went in
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it(`should run with args as string`, function (done) {
        // create the fake file
        var fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        var gulpYarnObject = gulpYarn({
            args: '--production --no-bin-links'
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', function (file) {
            // make sure it came out the same way it went in
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });
});
