import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';

export default function exist(qrcode: string): Promise<void> {
	if (fs.existsSync(qrcode)) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		const qrcodeDir = path.dirname(qrcode);
		const qrcodeName = path.basename(qrcode);
		fs.watch(qrcodeDir, 'binary', (eventType, fileName) => {
			core.info(`File ${eventType}: ${fileName}`);
			if (fileName === qrcodeName) {
				core.info(`Found the file: ${qrcodeName}`);
				resolve();
			}
		});
	});
}
