import fs from 'node:fs/promises';
import YAML from 'yaml';
import {type Result, fail} from './railway.js';

export type LoadingStatus = Result<
	Record<string, unknown>,
	{message: string; filename: string}
>;

export const readYaml = async (filename: string): Promise<LoadingStatus> => {
	let content: string;
	try {
		content = await fs.readFile(filename, {encoding: 'utf8'});
	} catch {
		return fail({
			message: `The yaml file cannot be found: ${filename}`,
			filename,
		});
	}

	try {
		const parsed: unknown = YAML.parse(content);
		if (parsed && typeof parsed === 'object') {
			return {
				status: 'success',
				value: parsed as Record<string, unknown>,
			};
		}
	} catch {
		return fail({
			message: `The yaml file cannot be parsed: ${filename}`,
			filename,
		});
	}

	return fail({
		message: `The yaml file cannot be parsed: ${filename}`,
		filename,
	});
};
