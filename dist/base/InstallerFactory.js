"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSourceMap = void 0;
const os = require("os");
const Installer_1 = require("./Installer");
function createDownloadLink(type, version) {
    return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}
const devtoolVersion = '1052102010';
exports.installSourceMap = {
    win32: new Installer_1.default({
        downloadUrl: createDownloadLink('x64', devtoolVersion),
        fileExtension: 'exe',
        sha1sum: '40d4234eb919418005631a217be63af652e52d2b',
        installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具',
        workDir: '',
    }),
    darwin: new Installer_1.default({
        downloadUrl: createDownloadLink('darwin', devtoolVersion),
        fileExtension: 'dmg',
        sha1sum: '3b2e22ae91897721ab6179b0e2da2eb0d649c239',
        installDir: '/Applications/wechatwebdevtools.app',
        workDir: 'Contents/MacOS',
    }),
};
class InstallFactory {
    static getInstance() {
        return exports.installSourceMap[os.platform()];
    }
}
exports.default = InstallFactory;
