"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const https = require("https");
const exec = require("execa");
const core = require("@actions/core");
const sha1_1 = require("../util/sha1");
const join_1 = require("../util/join");
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);
function createDownloadLink(type, version) {
    return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}
const devtoolVersion = '1052102010';
const installSource = {
    win32: {
        url: createDownloadLink('x64', devtoolVersion),
        ext: 'exe',
        sha1sum: '40d4234eb919418005631a217be63af652e52d2b',
        cli: 'cli.bat',
        location: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具',
    },
    darwin: {
        url: createDownloadLink('darwin', devtoolVersion),
        ext: 'dmg',
        sha1sum: '3b2e22ae91897721ab6179b0e2da2eb0d649c239',
        cli: 'cli',
        location: '/Applications/wechatwebdevtools.app/Contents/MacOS/',
    },
};
function openConnection(source) {
    return new Promise((resolve) => {
        const req = https.get(source, resolve);
        req.end();
    });
}
function save(res, saveTo) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(saveTo, 'binary');
        output.once('close', resolve);
        output.once('error', reject);
        res.pipe(output);
    });
}
class Installer {
    constructor() {
        const source = installSource[os.platform()];
        if (!source) {
            throw new Error('The current platform is not supported.');
        }
        this.source = source;
        this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${source.ext}`);
    }
    async download() {
        const res = await this.openConnection();
        await save(res, this.saveTo);
        const fingerprint = await sha1_1.default(this.saveTo);
        if (fingerprint !== this.source.sha1sum) {
            throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint} Expected: ${this.source.sha1sum}`);
        }
    }
    async install() {
        if (!fs.existsSync(this.saveTo)) {
            throw new Error('Installer has not been downloaded yet.');
        }
        const win32 = this.source.ext === 'exe';
        if (win32) {
            await exec(this.saveTo, ['/S']);
            await join_1.default('wechat-devtool-installer.exe');
        }
        else {
            await exec(`hdiutil attach ${this.saveTo}`, { shell: true });
            await exec('sudo cp -r "/Volumes/微信开发者工具 Stable/wechatwebdevtools.app" /Applications/wechatwebdevtools.app', { shell: true });
            await exec('hdiutil detach "/Volumes/微信开发者工具 Stable/"', { shell: true });
        }
        const rootDir = path.dirname(path.dirname(__dirname));
        const fromDir = path.join(rootDir, 'src', 'bin');
        const toDir = path.join(rootDir, 'bin');
        await mkdir(toDir);
        core.addPath(toDir);
        const cli = core.getInput('cli') || 'wxdev';
        if (win32) {
            await copyFile(path.join(fromDir, 'cli.cmd'), path.join(toDir, `${cli}.cmd`));
            await copyFile(path.join(fromDir, 'cli.ps1'), path.join(toDir, `${cli}.ps1`));
        }
        else {
            await copyFile(path.join(fromDir, 'cli.sh'), path.join(toDir, cli));
        }
    }
    async openConnection() {
        let link = this.source.url;
        for (;;) {
            const res = await openConnection(link);
            if (res.statusCode === 301 || res.statusCode === 302) {
                const { location } = res.headers;
                if (location) {
                    link = location;
                }
                else {
                    throw new Error('Received redirect without a new location.');
                }
            }
            else if (res.statusCode !== 200) {
                throw new Error(`Invalid download source. Status Code: ${res.statusCode}`);
            }
            else {
                return res;
            }
        }
    }
}
exports.default = Installer;
