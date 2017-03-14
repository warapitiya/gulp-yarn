/**
 * Created by mwarapitiya on 10/23/16.
 */

import childProcess from 'child_process';
import which from 'which';

export default (command, callback) => {
	which(command.cmd, (err, cmdpath) => {
		if (err) {
			callback(new Error(`Can't yarn! \`${command.cmd}\` doesn't seem to be installed.`));
			return;
		}
		const cmd = childProcess.spawn(cmdpath, command.args, {stdio: 'inherit', cwd: command.cwd || process.cwd()});
		cmd.on('close', code => {
			if (code !== 0) {
				return callback(new Error(`${command.cmd} exited with non-zero code ${code}`));
			}
			callback();
		});
	});
};
