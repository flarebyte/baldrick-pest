import { PestModel, safeParseBuild } from './pest-model.js';
import { readYaml } from './pest-file-io.js';
import { ValidationError } from './format-message.js';
import { andThen } from './railway.js';
import { PestFileSuiteOpts, TestingRunOpts } from './run-opts-model.js';
import { ReportTracker } from './reporter-model.js';
const createReportTracker = (): ReportTracker => ({
  stats: {
    suites: 1,
    tests: 0,
    passes: 0,
    failures: 0,
    pending: 0,
    start: new Date().toISOString(),
    end: '',
    duration: Date.now(),
  },
  tests: [],
});
type RunRegressionFailure =
  | { message: string; filename: string }
  | ValidationError[];

export const runRegressionSuite = async (opts: TestingRunOpts) => {
  console.log(opts)
  const readingResult = await readYaml(opts.specFile);
  const modelResult = andThen<object, PestModel, RunRegressionFailure>(
    safeParseBuild
  )(readingResult);

  if (modelResult.status === 'failure') {
    console.log(
      `Loading and parsing the baldrick-pest test file ${opts.specFile} failed`,
      modelResult.error
    );
    return;
  }

  if (modelResult.status === 'success') {
    const pestSuite: PestFileSuiteOpts = {
      reportTracker: createReportTracker(),
      pestModel: modelResult.value,
      runOpts: opts
    }
    console.log(pestSuite);
  }
};
