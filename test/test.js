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
let sandbox;

describe('gulpYarn', () => {

    beforeEach((done) => {
        sandbox = mockSpawn();
        childProcess.spawn = sandbox;
        sandbox.setDefault(sandbox.simple(0, 'sandbox content'));
        done();
    });

    it('should run `yarn --production` if stream contains `package.json` and `production` option is set', (done) => {
        // create the fake file
        const fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        const gulpYarnObject = gulpYarn({
            production: true
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', (file) => {
            // make sure it came out the same way it went in
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);

            // check the contents
            expect(file.contents.toString('utf8')).to.be.equal(JSON.stringify(pkg));
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it('should warn when sending not supported args', (done) => {
        // create the fake file
        const fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        const gulpYarnObject = gulpYarn({
            npm: true
        });

        gulpYarnObject.once('error', (error) => {
            // check child process calls
            expect(sandbox.calls.length).to.be.equal(0);

            // check error message
            expect(error).to.exist
                .and.be.instanceof(Error)
                .and.have.property('message', 'Command \'npm\' not supported.');
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it('should run without any arg', (done) => {
        // create the fake file
        const fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        const gulpYarnObject = gulpYarn({});

        gulpYarnObject.once('data', (file) => {
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(0);

            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);

    });

    it('should not run with empty file', (done) => {
        // create the fake file
        const fakeFile = new File({
            base: "package",
            path: "test/package.json"
        });

        // Create a gulpYarn plugin stream
        const gulpYarnObject = gulpYarn({
            production: true
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', (file) => {
            // make sure it came out the same way it went in
            should.exist(file.isBuffer());
            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);
    });

    it(`should run with args as array`, (done) => {
        // create the fake file
        const fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        const gulpYarnObject = gulpYarn({
            args: ['--production', '--no-bin-links']
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', (file) => {
            // make sure it came out the same way it went in
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);

            done();
        });

        // write the fake file to it
        gulpYarnObject.write(fakeFile);

    });

    it(`should run with args as string`, (done) => {
        // create the fake file
        const fakeFile = new File({
            base: "package",
            path: "test/package.json",
            contents: new Buffer(JSON.stringify(pkg))
        });

        // Create a gulpYarn plugin stream
        const gulpYarnObject = gulpYarn({
            args: '--production --no-bin-links'
        });

        // wait for the file to come back out
        gulpYarnObject.once('data', (file) => {
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
