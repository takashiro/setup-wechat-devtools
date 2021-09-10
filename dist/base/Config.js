"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = void 0;
const os = require("os");
const core = require("@actions/core");
const defaultConfig = {
    win32: {
        version: '1052108130',
        sha1sum: 'aaa0596a6bad74426e50aa8b93b46f0fd0779489',
    },
    darwin: {
        version: '1052108130',
        sha1sum: '660f64dbb0d4a607011fbf6346cb0346208e58d4',
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
