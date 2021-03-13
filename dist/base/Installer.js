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
    constructor(config) {
        this.downloadUrl = config.downloadUrl;
        this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${config.fileExtension}`);
        this.sha1sum = config.sha1sum;
        this.installDir = config.installDir;
        this.workDir = path.join(config.installDir, config.workDir);
    }
    getInstallDir() {
        return this.installDir;
    }
    getWorkDir() {
        return this.workDir;
    }
    async download() {
        const res = await this.openConnection();
        await save(res, this.saveTo);
        const fingerprint = await sha1_1.default(this.saveTo);
        if (fingerprint !== this.sha1sum) {
            throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint} Expected: ${this.sha1sum}`);
        }
    }
    async install() {
        if (!fs.existsSync(this.saveTo)) {
            throw new Error('Installer has not been downloaded yet.');
        }
        const win32 = this.saveTo.endsWith('.exe');
        if (win32) {
            await exec(this.saveTo, ['/S']);
            await join_1.default('wechat-devtool-installer.exe');
        }
        else {
            await exec('hdiutil', ['attach', this.saveTo]);
            await exec('sudo', ['cp', '-r', '/Volumes/微信开发者工具 Stable/wechatwebdevtools.app', this.installDir]);
            await exec('hdiutil', ['detach', '/Volumes/微信开发者工具 Stable/']);
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
        let link = this.downloadUrl;
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
