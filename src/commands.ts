/**
 * Created by Malindu Warapitiya on 2/7/17.
 */

export interface CommandOptions {
	production: boolean;
	dev: boolean;
	force: boolean;
	flat: boolean;
	noBinLinks: boolean;
	ignoreEngines: boolean;
	noProgress: boolean;
	noLockfile: boolean;
	ignoreScripts: boolean;
	nonInteractive: boolean;
	args: string[] | string;
}

export const Commands = {
	production: '--production',
	dev: '--dev',
	force: '--force',
	flat: '--flat',
	noBinLinks: '--no-bin-links',
	ignoreEngines: '--ignore-engines',
	noProgress: '--no-progress',
	noLockfile: '--no-lockfile',
	ignoreScripts: '--ignore-scripts',
	nonInteractive: '--non-interactive',
};
