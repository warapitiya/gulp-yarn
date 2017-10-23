/**
 * Created by mwarapitiya on 10/18/17.
 */

const childProcess = require('child_process');
const chai = require('chai');
const File = require('vinyl');
const mockSpawn = require('mock-spawn');
const gulpYarn = require('../index');
const expect = chai.expect;
const should = chai.should();
const pkg = require('./package.json');
let sandbox;

describe('gulpYarn', () => {

    beforeEach((done) => {
        sandbox = mockSpawn();
        childProcess.spawn = sandbox;
        sandbox.setDefault(sandbox.simple(0, 'sandbox content'));
        done();
    });

    afterEach((done) => {
        sandbox = null;
        done();
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

    it('should run with supported args', (done) => {
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

        gulpYarnObject.once('data', (file) => {
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
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
        const gulpYarnObject = gulpYarn();

        gulpYarnObject.once('data', (file) => {
            should.exist(file.isBuffer());

            // check child process calls
            expect(sandbox.calls.length).to.be.equal(1);
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
