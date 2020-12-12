import * as fs from 'fs';
import * as crypto from 'crypto';

/**
 * Calculate the SHA1 fingerprint of a file
 * @param filePath
 * @return SHA1 fingerprint of the file
 */
function sha1(filePath: string): Promise<string> {
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

export default sha1;
