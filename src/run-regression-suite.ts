import { ExpectModel, PestModel, safeParseBuild, StepModel } from './pest-model.js';
import { readYaml } from './pest-file-io.js';
import { ValidationError } from './format-message.js';
import { andThen, Result, succeed } from './railway.js';
import { PestFileSuiteOpts, TestingRunOpts } from './run-opts-model.js';
import { ReportTracker } from './reporter-model.js';
import { executeStep } from './execution.js';
import { UseCaseModel } from '../dist/pest-model.js';
import { Context, ShellResponse } from './context.js';
import { checkSnapshot } from './snapshot-creator.js';
import { getActualFromStdout, matchExitCode } from './matching-step.js';
import { getSnapshotFilename } from './naming.js';
import { readSnapshotFile } from './snapshot-io.js';
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

type SnaphotResponse = Result<string, string>

const checkResponseSnapshot = async (opts: TestingRunOpts, response: ShellResponse, expectation: ExpectModel, useCaseName: string): Promise<SnaphotResponse> => {
  if (expectation.snapshot === undefined){
    return succeed('ignore');
  }
  if (!matchExitCode(response.exitCode, expectation.exitCode)){
    return fail('wrong exit code')
  }

  const actual = getActualFromStdout(response, expectation)

  if (actual === undefined){
    return fail('No actual defined')
  }
  const snaphotFileName = getSnapshotFilename(opts, useCaseName, expectation.snapshot)
  const existingSnaphot = await readSnapshotFile(snaphotFileName)
  await checkSnapshot(actual, snaphotFileName, expected)

}

const executeStepAndSnaphot = async (ctx: Context, step: StepModel) => {
  console.log(step);
  const stepResult = await executeStep(ctx, step);
  const expect = step.expect;
  if (expect !== undefined){
    const snapshot = expect.snapshot
    if (typeof snapshot === 'string'){
      await checkSnapshot()
    }
  }
};
const runUseCase = async (ctx: Context, useCase: UseCaseModel) => {
  for (const step of useCase.steps) {
    await executeStepAndSnaphot(ctx, step);
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
    console.log(ctx);
  }
};
