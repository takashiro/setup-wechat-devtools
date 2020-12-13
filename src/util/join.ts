import * as ps from 'ps-list';

export default async function join(processName: string): Promise<void> {
	for (;;) {
		const processes = await ps();
		const target = processes.find((p) => p.name === processName);
		if (!target) {
			break;
		}
	}
}
