"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSourceMap = void 0;
function createDownloadLink(type, version) {
    return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}
const devtoolVersion = '1052102010';
exports.installSourceMap = {
    win32: {
        url: createDownloadLink('x64', devtoolVersion),
        ext: 'exe',
        sha1sum: '40d4234eb919418005631a217be63af652e52d2b',
        cli: 'cli.bat',
        installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具',
        workDir: '',
    },
    darwin: {
        url: createDownloadLink('darwin', devtoolVersion),
        ext: 'dmg',
        sha1sum: '3b2e22ae91897721ab6179b0e2da2eb0d649c239',
        cli: 'cli',
        installDir: '/Applications/wechatwebdevtools.app',
        workDir: 'Contents/MacOS',
    },
};
