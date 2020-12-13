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
const installSource = {
    win32: {
        url: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1032011120&version_type=1',
        ext: 'exe',
        sha1sum: '1c17b662fabbc13204f48bda3b91944b59676a85',
        cli: 'cli.bat',
        location: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具',
    },
    darwin: {
        url: 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1032011120&version_type=1',
        ext: 'dmg',
        sha1sum: '96f05da1daed6e17796bb51f34b0d493cbaed236',
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
            await exec('sudo cp -r "/Volumes/微信开发者工具 Stable/wechatwebdevtools.app" /Applications', { shell: true });
            await exec('hdiutil detach "/Volumes/微信开发者工具 Stable/"', { shell: true });
        }
        const rootDir = path.dirname(path.dirname(__dirname));
        const binPath = path.join(rootDir, 'bin');
        await mkdir(binPath);
        core.addPath(binPath);
        const cli = core.getInput('cli') || 'wxdev';
        const source = path.join(rootDir, 'src/bin', `cli.${win32 ? 'bat' : 'sh'}`);
        const target = path.join(binPath, win32 ? `${cli}.bat` : cli);
        await copyFile(source, target);
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
