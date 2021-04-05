import * as os from 'os';

import Installer from './Installer';

function createDownloadLink(type: string, version: string): string {
	return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}

const devtoolVersion = '1052103190';

export const installSourceMap: Record<string, Installer> = {
	win32: new Installer({
		version: devtoolVersion,
		platform: 'x64',
		downloadUrl: createDownloadLink('x64', devtoolVersion),
		fileExtension: 'exe',
		sha1sum: '94d4916b8edfd8a4ae79022b07ab74f7d633f116',
		installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具', // Not configurable yet?
	}),
	darwin: new Installer({
		version: devtoolVersion,
		platform: 'darwin',
		downloadUrl: createDownloadLink('darwin', devtoolVersion),
		fileExtension: 'dmg',
		sha1sum: 'a6efe498645431a78f592e0057dc3f22d9a96d15',
		installDir: '/Applications/wechatwebdevtools.app',
	}),
};

export default class InstallFactory {
	static getInstance(): Installer | undefined {
		return installSourceMap[os.platform()];
	}
}
