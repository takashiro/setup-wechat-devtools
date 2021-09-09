"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = void 0;
const os = require("os");
const core = require("@actions/core");
const defaultConfig = {
    win32: {
        version: '1052103200',
        sha1sum: 'b72b1edff94d46177e5f0d452163bfea3dac16ca',
    },
    darwin: {
        version: '1052103200',
        sha1sum: '313ea5b360f5680b74c17a28200f14d46d3ab2b8',
    },
};
function read() {
    const config = {
        ...defaultConfig[os.platform()],
    };
    const version = core.getInput('version');
    if (version) {
        config.version = version;
    }
    const sha1sum = core.getInput('sha1sum');
    if (sha1sum) {
        config.sha1sum = sha1sum;
    }
    return config;
}
exports.read = read;
