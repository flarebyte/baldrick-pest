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
import { reportCase, reportStartSuite, reportStopSuite } from './reporter.js';
import { reportMochaJson } from './mocha-json-reporter.js';
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
  { actual: string; expected: string; message: string }
>;

const checkExpectationAndSnapshot = async (params: {
  opts: TestingRunOpts;
  response: ShellResponse;
  step: StepModel;
  useCase: UseCaseModel;
}): Promise<SnaphotResponse> => {
  const { opts, response, step, useCase } = params;
  if (step.expect === undefined) {
    return succeed({ message: 'Nothing is expected' });
  }

  if (!matchExitCode(response.exitCode, step.expect.exitCode)) {
    return fail({
      message: `The exit code is ${response.exitCode} but we expect ${step.expect.exitCode}`,
      actual: `${response.exitCode}`,
      expected: step.expect.exitCode,
    });
  }

  if (step.expect.snapshot === undefined) {
    return succeed({ message: 'Nothing is expected' });
  }

  const actual = getActualFromStdout(response, step.expect);

  if (actual === undefined) {
    return fail({ message: 'No actual defined', actual: '', expected: '' });
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
      message: compareResult.error.message,
      actual: compareResult.error.actual,
      expected: compareResult.error.expected,
    });
  }
};

const executeStepAndSnaphot = async (params: {
  opts: PestFileSuiteOpts;
  ctx: Context;
  step: StepModel;
  useCase: UseCaseModel;
}) => {
  const { opts, ctx, step, useCase } = params;
  const title = step.title;
  const specFile = opts.runOpts.specFile;
  const snapshotFile =
    step.expect?.snapshot === undefined
      ? undefined
      : getSnapshotFilename(opts.runOpts, useCase.name, step.expect.snapshot);

  const reportingCaseDefault = {
    title,
    fullTitle: title,
    file: specFile,
    sourceFile: 'not-applicable',
    snapshotFile,
  };
  const stepResult = await executeStep(ctx, step);
  if (stepResult.status === 'success') {
    const snapshotResponse = await checkExpectationAndSnapshot({
      opts: opts.runOpts,
      step,
      response: stepResult.value.response,
      useCase,
    });
    if (snapshotResponse.status === 'success') {
      reportCase(opts.reportTracker, {
        ...reportingCaseDefault,
        duration: 0,
      });
    } else {
      const { message, actual, expected } = snapshotResponse.error;
      reportCase(opts.reportTracker, {
        ...reportingCaseDefault,
        duration: 0,
        err: {
          code: 'ERR_ASSERTION',
          message,
          actual,
          expected,
          operator: 'strictEqual',
        },
      });
    }
  } else {
    const snapshotResponse = await checkExpectationAndSnapshot({
      opts: opts.runOpts,
      step,
      response: stepResult.error.response,
      useCase,
    });
    if (snapshotResponse.status === 'success') {
      reportCase(opts.reportTracker, {
        ...reportingCaseDefault,
        duration: 0,
      });
    } else {
      const { message, actual, expected } = snapshotResponse.error;
      reportCase(opts.reportTracker, {
        ...reportingCaseDefault,
        duration: 0,
        err: {
          code: 'ERR_ASSERTION',
          message,
          actual,
          expected,
          operator: 'strictEqual',
        },
      });
    }
  }
};

const runUseCase = async (params: {
  opts: PestFileSuiteOpts;
  ctx: Context;
  useCase: UseCaseModel;
}) => {
  const { opts, ctx, useCase } = params;
  reportStartSuite(
    `${opts.pestModel.title} - ${useCase.name}`,
    'to be defined'
  );
  for (const step of useCase.steps) {
    await executeStepAndSnaphot({ opts, ctx, step, useCase });
  }
  reportStopSuite();
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
      await runUseCase({ opts: pestSuite, ctx, useCase });
    }

    if (opts.mochaJsonReport) {
      await reportMochaJson(pestSuite);
    }
  }
};
