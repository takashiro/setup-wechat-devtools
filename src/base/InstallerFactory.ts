import * as os from 'os';

import Installer from './Installer';

function createDownloadLink(type: string, version: string): string {
	return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}

const devtoolVersion = '1052102010';

export const installSourceMap: Record<string, Installer> = {
	win32: new Installer({
		version: devtoolVersion,
		platform: 'x64',
		downloadUrl: createDownloadLink('x64', devtoolVersion),
		fileExtension: 'exe',
		sha1sum: '40d4234eb919418005631a217be63af652e52d2b',
		installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具', // Not configurable yet?
	}),
	darwin: new Installer({
		version: devtoolVersion,
		platform: 'darwin',
		downloadUrl: createDownloadLink('darwin', devtoolVersion),
		fileExtension: 'dmg',
		sha1sum: '3b2e22ae91897721ab6179b0e2da2eb0d649c239',
		installDir: '/Applications/wechatwebdevtools.app',
	}),
};

export default class InstallFactory {
	static getInstance(): Installer | undefined {
		return installSourceMap[os.platform()];
	}
}
