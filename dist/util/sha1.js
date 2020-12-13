"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const crypto = require("crypto");
/**
 * Calculate the SHA1 fingerprint of a file
 * @param filePath
 * @return SHA1 fingerprint of the file
 */
function sha1(filePath) {
    return new Promise((resolve, reject) => {
        const input = fs.createReadStream(filePath);
        input.once('error', reject);
        const output = crypto.createHash('sha1');
        output.setEncoding('hex');
        const pipe = input.pipe(output);
        pipe.once('error', reject);
        pipe.once('finish', () => {
            resolve(pipe.read());
        });
    });
}
exports.default = sha1;
