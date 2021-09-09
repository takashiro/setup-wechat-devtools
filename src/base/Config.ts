import * as os from 'os';
import * as core from '@actions/core';

export interface Config {
	readonly version: string;
	readonly sha1sum: string;
}

const defaultConfig: Record<string, Config> = {
	win32: {
		version: '1052103200',
		sha1sum: 'b72b1edff94d46177e5f0d452163bfea3dac16ca',
	},
	darwin: {
		version: '1052103200',
		sha1sum: '313ea5b360f5680b74c17a28200f14d46d3ab2b8',
	},
};

export function read(): Config {
	const config = {
		...defaultConfig[os.platform()],
	};

	const version = core.getInput('version');
	if (version) {
		config.version = version;
	}

	const sha1sum = core.getInput('sha1sum');
	if (sha1sum) {
		config.sha1sum = sha1sum;
	}

	return config;
}
