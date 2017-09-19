/* jshint camelcase: false, strict: false */
/* global describe, beforeEach, it */

import chai from 'chai';
import Vinyl from 'vinyl';
import path from 'path';
import commandRunner from '../lib/utils/commandRunner';
import yarn from '../lib/index';
const should = chai.should();
const expect = chai.expect;
const args = process.argv.slice();

function fixture(file) {
    const filepath = path.join(__dirname, file);
    return new Vinyl({
        path: filepath,
        cwd: __dirname,
        base: path.join(__dirname, path.dirname(file)),
        contents: null
    });
}

let originalRun;

describe('gulp-yarn', () => {
    beforeEach(() => {
        originalRun = commandRunner.run;
        commandRunner.run = mockRunner();
        process.argv = args;
    });

    afterEach(() => {
        commandRunner.run = originalRun;
    });

    it('should run `yarn` if stream contains `package.json`', done => {
        const file = fixture('package.json');

        const stream = yarn();

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql([]);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should not run `yarn`', done => {
        const file = fixture('package.json');

        const stream = yarn({
            unknown: true
        });

        stream.on('error', err => {
            expect(err).to.be.an('error');
            done();
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(0);
            commandRunner.run.commands[0].args.should.eql([]);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --production` if stream contains `package.json` and `production` option is set',
        done => {
            const file = fixture('package.json');

            const stream = yarn({production: true});

            stream.on('error', err => {
                should.exist(err);
                done(err);
            });

            stream.on('data', () => {
            });

            stream.on('end', () => {
                commandRunner.run.called.should.equal(1);
                commandRunner.run.commands[0].cmd.should.equal('yarn');
                commandRunner.run.commands[0].args.should.eql(['--production']);
                done();
            });

            stream.write(file);

            stream.end();
        });

    it('should run `yarn --flat` if stream contains `package.json` and `flat` option is set', done => {
        const file = fixture('package.json');

        const stream = yarn({flat: true});

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--flat']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --dev` if stream contains `package.json` and `dev` option is set', done => {
        const file = fixture('package.json');

        const stream = yarn({dev: true});

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--dev']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --force` if stream contains `package.json` and `force` option is set', done => {
        const file = fixture('package.json');

        const stream = yarn({force: true});

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--force']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --no-bin-links` if stream contains `package.json` and `noBinLinks` option is set',
        done => {
            const file = fixture('package.json');

            const stream = yarn({noBinLinks: true});

            stream.on('error', err => {
                should.exist(err);
                done(err);
            });

            stream.on('data', () => {
            });

            stream.on('end', () => {
                commandRunner.run.called.should.equal(1);
                commandRunner.run.commands[0].cmd.should.equal('yarn');
                commandRunner.run.commands[0].args.should.eql(['--no-bin-links']);
                done();
            });

            stream.write(file);

            stream.end();
        });

    it('should run `yarn --ignore-engines` if stream contains `package.json` and `ignoreEngines` option is set',
        done => {
            const file = fixture('package.json');

            const stream = yarn({ignoreEngines: true});

            stream.on('error', err => {
                should.exist(err);
                done(err);
            });

            stream.on('data', () => {
            });

            stream.on('end', () => {
                commandRunner.run.called.should.equal(1);
                commandRunner.run.commands[0].cmd.should.equal('yarn');
                commandRunner.run.commands[0].args.should.eql(['--ignore-engines']);
                done();
            });

            stream.write(file);

            stream.end();
        });

    it('should run `yarn --ignore-scripts` if stream contains `package.json` and `ignoreScripts` option is set',
        done => {
            const file = fixture('package.json');

            const stream = yarn({ignoreScripts: true});

            stream.on('error', err => {
                should.exist(err);
                done(err);
            });

            stream.on('data', () => {
            });

            stream.on('end', () => {
                commandRunner.run.called.should.equal(1);
                commandRunner.run.commands[0].cmd.should.equal('yarn');
                commandRunner.run.commands[0].args.should.eql(['--ignore-scripts']);
                done();
            });

            stream.write(file);

            stream.end();
        });

    it('should run `yarn --no-progress` to disable progress bar', done => {
        const file = fixture('package.json');

        const stream = yarn({noProgress: true});

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--no-progress']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --no-lockfile` to don`t read or generate a lockfile', done => {
        const file = fixture('package.json');

        const stream = yarn({noLockfile: true});

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--no-lockfile']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --production --flat`', done => {
        const file = fixture('package.json');

        const stream = yarn({
            production: true,
            flat: true
        });

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--production', '--flat']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --version` with Array of `args` property', done => {
        const file = fixture('package.json');

        const stream = yarn({
            args: [
                '--version'
            ]
        });

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--version']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run `yarn --version` with String of `args` property', done => {
        const file = fixture('package.json');

        const stream = yarn({
            args: '--version'
        });

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(1);
            commandRunner.run.commands[0].cmd.should.equal('yarn');
            commandRunner.run.commands[0].args.should.eql(['--version']);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should not run with invalid `package.json`', done => {
        const file = fixture('package123.json');

        const stream = yarn();

        stream.on('error', err => {
            should.exist(err);
            done(err);
        });

        stream.on('data', () => {
        });

        stream.on('end', () => {
            commandRunner.run.called.should.equal(0);
            done();
        });

        stream.write(file);

        stream.end();
    });

    it('should run commandRunner', done => {
        const commands = {
            cmd: 'yarn',
            args: ['--version'],
            cwd: __dirname
        };
        originalRun(commands, (error) => {
            expect(error).not.to.be.an('error');
            done();
        });

    });

    it('should not run commandRunner', done => {
        const commands = {
            cmd: 'yarnTest',
            args: ['--version'],
            cwd: __dirname
        };
        originalRun(commands, (error) => {
            expect(error).to.be.an('error');
            done();
        });

    });
});

/**
 * mock runner function
 * @returns {mock}
 */
function mockRunner() {
    const mock = function (cmd, cb) {
        mock.called += 1;
        mock.commands.push(cmd);
        cb();
    };
    mock.called = 0;
    mock.commands = [];
    return mock;
}
