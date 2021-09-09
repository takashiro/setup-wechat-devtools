"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const exec = require("execa");
const core = require("@actions/core");
const cache = require("@actions/tool-cache");
const sha1_1 = require("../util/sha1");
const join_1 = require("../util/join");
const Config_1 = require("./Config");
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);
function createDownloadLink(type, version) {
    return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}
class Installer {
    constructor(config) {
        this.version = config.version;
        this.platform = config.platform;
        this.downloadUrl = config.downloadUrl;
        this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${config.fileExtension}`);
        this.sha1sum = config.sha1sum;
        this.installDir = config.installDir;
    }
    getInstallDir() {
        return this.installDir;
    }
    async download() {
        const savedTo = await cache.downloadTool(this.downloadUrl, this.saveTo);
        const fingerprint = await (0, sha1_1.default)(savedTo);
        if (fingerprint !== this.sha1sum) {
            throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint} Expected: ${this.sha1sum}`);
        }
    }
    async install() {
        if (!fs.existsSync(this.saveTo)) {
            throw new Error('Installer has not been downloaded yet.');
        }
        if (this.platform === 'x64') {
            await exec(this.saveTo, ['/S']);
            await (0, join_1.default)('wechat-devtool-installer.exe');
        }
        else {
            await exec('hdiutil', ['attach', this.saveTo]);
            await exec('sudo', ['cp', '-r', '/Volumes/微信开发者工具 Stable/wechatwebdevtools.app', this.installDir]);
            await exec('hdiutil', ['detach', '/Volumes/微信开发者工具 Stable/']);
        }
    }
    async vars() {
        const rootDir = path.dirname(path.dirname(__dirname));
        const fromDir = path.join(rootDir, 'src', 'bin');
        const toDir = path.join(rootDir, 'bin');
        await mkdir(toDir);
        core.addPath(toDir);
        const cli = core.getInput('cli') || 'wxdev';
        if (this.platform === 'x64') {
            await copyFile(path.join(fromDir, 'cli.cmd'), path.join(toDir, `${cli}.cmd`));
            await copyFile(path.join(fromDir, 'cli.ps1'), path.join(toDir, `${cli}.ps1`));
        }
        else {
            await copyFile(path.join(fromDir, 'cli.sh'), path.join(toDir, cli));
        }
    }
    static getInstance() {
        const config = (0, Config_1.read)();
        if (os.platform() === 'win32') {
            return new Installer({
                version: config.version,
                platform: 'x64',
                downloadUrl: createDownloadLink('x64', config.version),
                fileExtension: 'exe',
                sha1sum: config.sha1sum,
                installDir: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具', // Not configurable yet?
            });
        }
        if (os.platform() === 'darwin') {
            return new Installer({
                version: config.version,
                platform: 'darwin',
                downloadUrl: createDownloadLink('darwin', config.version),
                fileExtension: 'dmg',
                sha1sum: config.sha1sum,
                installDir: '/Applications/wechatwebdevtools.app',
            });
        }
        return undefined;
    }
}
exports.default = Installer;
