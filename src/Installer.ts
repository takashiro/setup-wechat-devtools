import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as https from 'https';
import { IncomingMessage } from 'http';
import { exec } from '@actions/exec';

const installerLink: Record<string, string> = {
	win32: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1032011120&version_type=1',
	darwin: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1032011120&version_type=1',
};

const installerExt: Record<string, string> = {
	win32: 'exe',
	darwin: 'dmg',
};

function downloadUrl(source: string): Promise<IncomingMessage> {
	return new Promise((resolve) => {
		const req = https.get(source, resolve);
		req.end();
	});
}

export default class Installer {
	protected platform: NodeJS.Platform;

	protected installerPath: string;

	constructor() {
		this.platform = os.platform();
		this.installerPath = path.join(os.tmpdir(), `devtools.${this.getExt()}`);
	}

	async download(): Promise<void> {
		const res = await this.openConnection();
		this.save(res);
	}

	async install(): Promise<void> {
		const { installerPath } = this;
		if (!installerPath) {
			throw new Error('Installer has not been downloaded yet.');
		}

		if (this.platform === 'win32') {
			await exec(installerPath, ['/S']);
		} else {
			throw new Error('The platform is not supported yet.');
		}
	}

	async openConnection(): Promise<IncomingMessage> {
		let source = this.getSource();
		if (!source) {
			return Promise.reject(new Error('The current platform is not supported.'));
		}

		for (;;) {
			const res: IncomingMessage = await downloadUrl(source);
			if (res.statusCode === 301 || res.statusCode === 302) {
				const { location } = res.headers;
				if (location) {
					source = location;
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

	save(res: IncomingMessage): Promise<void> {
		return new Promise((resolve, reject) => {
			const output = fs.createWriteStream(this.installerPath, 'binary');
			output.once('close', resolve);
			output.once('error', reject);
			res.pipe(output);
		});
	}

	isSupported(): boolean {
		return this.platform === 'win32';
	}

	getSource(): string | undefined {
		return installerLink[this.platform];
	}

	getExt(): string | undefined {
		return installerExt[this.platform];
	}
}
