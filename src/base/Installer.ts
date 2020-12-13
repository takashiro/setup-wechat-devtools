import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as https from 'https';
import { IncomingMessage } from 'http';
import * as exec from 'execa';
import * as core from '@actions/core';

import sha1 from '../util/sha1';
import join from '../util/join';

const symlink = util.promisify(fs.symlink);
const copyFile = util.promisify(fs.copyFile);

interface InstallSource {
	url: string;
	ext: string;
	sha1sum: string;
	cli: string;
	location: string;
}

const installSource: Record<string, InstallSource> = {
	win32: {
		url: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1032011120&version_type=1',
		ext: 'exe',
		sha1sum: '1c17b662fabbc13204f48bda3b91944b59676a85',
		cli: 'cli.bat',
		location: 'C:\\Progra~2\\Tencent\\微信开发者工具',
	},
	darwin: {
		url: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1032011120&version_type=1',
		ext: 'dmg',
		sha1sum: '',
		cli: 'cli',
		location: '/Applications/wechatwebdevtools.app/Contents/MacOS/',
	},
};

function openConnection(source: string): Promise<IncomingMessage> {
	return new Promise((resolve) => {
		const req = https.get(source, resolve);
		req.end();
	});
}

function save(res: IncomingMessage, saveTo: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(saveTo, 'binary');
		output.once('close', resolve);
		output.once('error', reject);
		res.pipe(output);
	});
}

export default class Installer {
	protected source: InstallSource;

	protected saveTo: string;

	constructor() {
		const source = installSource[os.platform()];
		if (!source) {
			throw new Error('The current platform is not supported.');
		}
		this.source = source;
		this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${source.ext}`);
	}

	async download(): Promise<void> {
		const res = await this.openConnection();
		await save(res, this.saveTo);

		const fingerprint = await sha1(this.saveTo);
		if (fingerprint !== this.source.sha1sum) {
			throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint}`);
		}
	}

	async install(): Promise<void> {
		if (!fs.existsSync(this.saveTo)) {
			throw new Error('Installer has not been downloaded yet.');
		}

		if (this.source.ext === 'exe') {
			await exec(this.saveTo, ['/S']);
			await join('wechat-devtool-installer.exe');
		} else {
			throw new Error('The platform is not supported yet.');
		}

		core.addPath(this.source.location);
		const cli = core.getInput('cli') || 'wxdev';
		if (cli === 'cli') {
			return;
		}

		if (this.source.cli.endsWith('.bat')) {
			await copyFile(
				path.join(this.source.location, this.source.cli),
				path.join(this.source.location, `${cli}.bat`),
			);
		} else {
			await symlink(
				path.join(this.source.location, this.source.cli),
				path.join(this.source.location, cli),
			);
		}
	}

	async openConnection(): Promise<IncomingMessage> {
		let link = this.source.url;
		for (;;) {
			const res: IncomingMessage = await openConnection(link);
			if (res.statusCode === 301 || res.statusCode === 302) {
				const { location } = res.headers;
				if (location) {
					link = location;
				} else {
					throw new Error('Received redirect without a new location.');
				}
			} else if (res.statusCode !== 200) {
				throw new Error(`Invalid download source. Status Code: ${res.statusCode}`);
			} else {
				return res;
			}
		}
	}
}
