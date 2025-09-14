import {dirname} from 'node:path';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {type Result, fail, succeed} from './railway.js';

type SnapshotStoreResult = Result<
	string,
	{filename: string; message: string}
>;

export const readSnapshotFile = async (filename: string): Promise<SnapshotStoreResult> => {
	try {
		const value = await readFile(filename, {encoding: 'utf8'});
		return succeed(value);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return fail({
				filename,
				message: error.message,
			});
		}

		throw error;
	}
};

export const writeSnapshotFile = async (
	filename: string,
	content: string,
): Promise<void> => {
	await mkdir(dirname(filename), {recursive: true});
	await writeFile(filename, content, {encoding: 'utf8'});
};
