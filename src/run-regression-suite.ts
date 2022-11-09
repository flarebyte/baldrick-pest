import {
  PestModel,
  safeParseBuild,
  StepModel,
  UseCaseModel,
} from './pest-model.js';
import { readYaml } from './pest-file-io.js';
import { ValidationError } from './format-message.js';
import { andThen, Result, succeed, fail } from './railway.js';
import { PestFileSuiteOpts, TestingRunOpts } from './run-opts-model.js';
import { ReportTracker } from './reporter-model.js';
import { executeStep } from './execution.js';
import { Context, ShellResponse } from './context.js';
import { checkSnapshot } from './snapshot-creator.js';
import { getActualFromStdout, matchExitCode } from './matching-step.js';
import { getSnapshotFilename } from './naming.js';
import { readSnapshotFile } from './snapshot-io.js';
import { enhanceModel } from './model-enhancer.js';
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
  step: StepModel;
  useCase: UseCaseModel;
}): Promise<SnaphotResponse> => {
  const { opts, response, step, useCase } = params;
  if (step.expect === undefined || step.expect.snapshot === undefined) {
    return succeed({ message: 'ignore' });
  }
  if (!matchExitCode(response.exitCode, step.expect.exitCode)) {
    return fail({ message: 'wrong exit code', difference: `Expected ${step.expect.exitCode} but got response.exitCode` });
  }

  const actual = getActualFromStdout(response, step.expect);

  if (actual === undefined) {
    return fail({ message: 'No actual defined', difference: '' });
  }
  const snapshotFileName = getSnapshotFilename(
    opts,
    useCase.name,
    step.expect.snapshot
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

const executeStepAndSnaphot = async (params: {
  opts: TestingRunOpts;
  ctx: Context;
  step: StepModel;
  useCase: UseCaseModel;
}) => {
  const { opts, ctx, step, useCase } = params;
  const stepResult = await executeStep(ctx, step);
  if (stepResult.status === 'success') {
    await checkResponseSnapshot({
      opts,
      step,
      response: stepResult.value.response,
      useCase,
    });
  }
};

const runUseCase = async (params: {
  opts: TestingRunOpts;
  ctx: Context;
  useCase: UseCaseModel;
}) => {
  const { opts, ctx, useCase } = params;
  for (const step of useCase.steps) {
    await executeStepAndSnaphot({ opts, ctx, step, useCase });
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
      pestModel: enhanceModel(modelResult.value),
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
      await runUseCase({ opts, ctx, useCase });
    }
  }
};
