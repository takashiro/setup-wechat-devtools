import * as os from 'os';

import Installer from './Installer';

function createDownloadLink(type: string, version: string): string {
	return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}

const devtoolVersion = '1052103200';

export const installSourceMap: Record<string, Installer> = {
	win32: new Installer({
		version: devtoolVersion,
		platform: 'x64',
		downloadUrl: createDownloadLink('x64', devtoolVersion),
		fileExtension: 'exe',
		sha1sum: 'b72b1edff94d46177e5f0d452163bfea3dac16ca',
		installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具', // Not configurable yet?
	}),
	darwin: new Installer({
		version: devtoolVersion,
		platform: 'darwin',
		downloadUrl: createDownloadLink('darwin', devtoolVersion),
		fileExtension: 'dmg',
		sha1sum: '313ea5b360f5680b74c17a28200f14d46d3ab2b8',
		installDir: '/Applications/wechatwebdevtools.app',
	}),
};

export default class InstallFactory {
	static getInstance(): Installer | undefined {
		return installSourceMap[os.platform()];
	}
}
