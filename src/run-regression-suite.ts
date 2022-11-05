import { PestModel, safeParseBuild } from './pest-model.js';
import { readYaml } from './file-io.js';
import { ValidationError } from './format-message.js';
import { andThen } from './railway.js';

type RunRegressionFailure =
  | { message: string; filename: string }
  | ValidationError[];

export const runRegressionSuite = async (target: string) => {
  const readingResult = await readYaml(target);
  const modelResult = andThen<object, PestModel, RunRegressionFailure>(
    safeParseBuild
  )(readingResult);

  if (modelResult.status === 'failure') {
    console.log(
      `Loading and parsing the baldrick-pest test file ${target} failed`,
      modelResult.error
    );
    return;
  }

  if (modelResult.status === 'success') {
    console.log(modelResult.value);
  }
};
