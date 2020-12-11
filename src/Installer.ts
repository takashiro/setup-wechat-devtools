import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as https from 'https';
import { exec } from '@actions/exec';

const downloadLink: Record<string, string> = {
	win32: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1032011120&version_type=1',
	darwin: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1032011120&version_type=1',
};

const installerExt: Record<string, string> = {
	win32: 'exe',
	darwin: 'dmg',
};

export default class Installer {
	protected platform: NodeJS.Platform;

	protected installerPath: string;

	constructor() {
		this.platform = os.platform();
		this.installerPath = path.join(os.tmpdir(), `devtools.${this.getExt()}`);
	}

	download(): Promise<void> {
		const source = this.getSource();
		if (!source) {
			return Promise.reject(new Error('The current platform is not supported.'));
		}

		return new Promise((resolve, reject) => {
			https.get(source, (res) => {
				if (res.statusCode === 200) {
					const output = fs.createWriteStream(this.installerPath, 'binary');
					output.once('close', resolve);
					output.once('error', reject);
					res.pipe(output);
				} else {
					reject(new Error(`Failed to download install package from ${source}. Status Code: ${res.statusCode}`));
				}
			});
		});
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

	isSupported(): boolean {
		return this.platform === 'win32';
	}

	getSource(): string | undefined {
		return downloadLink[this.platform];
	}

	getExt(): string | undefined {
		return installerExt[this.platform];
	}
}
