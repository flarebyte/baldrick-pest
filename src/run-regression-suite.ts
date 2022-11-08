import {
  ExpectModel,
  PestModel,
  safeParseBuild,
  StepModel,
} from './pest-model.js';
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

type SnaphotResponse = Result<
  { message: string },
  { message: string; difference: string }
>;

const checkResponseSnapshot = async (params: {
  opts: TestingRunOpts;
  response: ShellResponse;
  expectation: ExpectModel;
  useCaseName: string;
}): Promise<SnaphotResponse> => {
  const { opts, response, expectation, useCaseName } = params;
  if (expectation.snapshot === undefined) {
    return succeed({ message: 'ignore' });
  }
  if (!matchExitCode(response.exitCode, expectation.exitCode)) {
    return fail({ message: 'wrong exit code' });
  }

  const actual = getActualFromStdout(response, expectation);

  if (actual === undefined) {
    return fail({ message: 'No actual defined' });
  }
  const snapshotFileName = getSnapshotFilename(
    opts,
    useCaseName,
    expectation.snapshot
  );
  const existingSnapshotResult = await readSnapshotFile(snapshotFileName);
  const expected =
    existingSnapshotResult.status === 'success'
      ? existingSnapshotResult.value
      : undefined;
  const compareResult = await checkSnapshot(actual, snapshotFileName, expected);
  if (compareResult.status === 'success') {
    return succeed({ message: 'Matches existing snapshot' });
  } else {
    return fail({
      message: 'Differs from existing snapshot',
      difference: compareResult.error.message,
    });
  }
};

const executeStepAndSnaphot = async (opts: TestingRunOpts, ctx: Context, step: StepModel) => {
  console.log(step);
  const stepResult = await executeStep(ctx, step);
  if (stepResult.status === 'success') {
    const snapshot = expect.snapshot;
    await checkResponseSnapshot({ opts, })
  }
};
const runUseCase = async (opts: TestingRunOpts, ctx: Context, useCase: UseCaseModel) => {
  for (const step of useCase.steps) {
    await executeStepAndSnaphot(opts, ctx, step);
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
