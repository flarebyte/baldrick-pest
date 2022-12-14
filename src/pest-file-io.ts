import YAML from 'yaml';
import fs from 'node:fs/promises';
import { Result, fail } from './railway.js';
export type LoadingStatus = Result<
  object,
  { message: string; filename: string }
>;

export const readYaml = async (filename: string): Promise<LoadingStatus> => {
  let content;
  try {
    content = await fs.readFile(filename, { encoding: 'utf8' });
  } catch {
    return fail({
      message: `The yaml file cannot be found: ${filename}`,
      filename,
    });
  }

  try {
    const value = YAML.parse(content);
    return {
      status: 'success',
      value,
    };
  } catch {
    return fail({
      message: `The yaml file cannot be parsed: ${filename}`,
      filename,
    });
  }
};
