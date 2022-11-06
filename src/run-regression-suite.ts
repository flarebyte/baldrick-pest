import { PestModel, safeParseBuild } from './pest-model.js';
import { readYaml } from './pest-file-io.js';
import { ValidationError } from './format-message.js';
import { andThen } from './railway.js';
import { PestFileSuiteOpts, TestingRunOpts } from './run-opts-model.js';
import { ReportTracker } from './reporter-model.js';
import { executeStep } from './execution.js';
import { UseCaseModel } from '../dist/pest-model.js';
import { Context } from './context.js';
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

const runUseCase = async (ctx: Context, useCase: UseCaseModel) => {
  for (const step of useCase.steps) {
    console.log(step)
    await executeStep(ctx, step);
  }
};

export const runRegressionSuite = async (opts: TestingRunOpts) => {
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
      runOpts: opts,
    };

    const ctx = {
      steps: [],
    };
    for (const key in pestSuite.pestModel.cases) {
      const useCase = pestSuite.pestModel.cases[key];
      if (useCase === undefined) {
        continue;
      }
      await runUseCase(ctx, useCase);
    }
    console.log(ctx)
  }
};
