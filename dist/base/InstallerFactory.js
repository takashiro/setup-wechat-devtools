"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSourceMap = void 0;
const os = require("os");
const Installer_1 = require("./Installer");
function createDownloadLink(type, version) {
    return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}
const devtoolVersion = '1052103190';
exports.installSourceMap = {
    win32: new Installer_1.default({
        version: devtoolVersion,
        platform: 'x64',
        downloadUrl: createDownloadLink('x64', devtoolVersion),
        fileExtension: 'exe',
        sha1sum: '94d4916b8edfd8a4ae79022b07ab74f7d633f116',
        installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具', // Not configurable yet?
    }),
    darwin: new Installer_1.default({
        version: devtoolVersion,
        platform: 'darwin',
        downloadUrl: createDownloadLink('darwin', devtoolVersion),
        fileExtension: 'dmg',
        sha1sum: 'a6efe498645431a78f592e0057dc3f22d9a96d15',
        installDir: '/Applications/wechatwebdevtools.app',
    }),
};
class InstallFactory {
    static getInstance() {
        return exports.installSourceMap[os.platform()];
    }
}
exports.default = InstallFactory;
