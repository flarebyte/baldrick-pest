import type { Context, ShellResponse } from './context.js';
import { executeStep } from './execution.js';
import type { ValidationError } from './format-message.js';
import { getActualFromStdout, matchExitCode } from './matching-step.js';
import { reportMochaJson } from './mocha-json-reporter.js';
import { enhanceModel } from './model-enhancer.js';
import { getSnapshotFilename } from './naming.js';
import { readYaml } from './pest-file-io.js';
import {
  type PestModel,
  type StepModel,
  safeParseBuild,
  type UseCaseModel,
} from './pest-model.js';
import { andThen, fail, type Result, succeed } from './railway.js';
import {
  reportCaseStep,
  reportSkipped,
  reportStartSuite,
  reportStopSuite,
  reportTodo,
} from './reporter.js';
import type { ReportTracker } from './reporter-model.js';
import type { PestFileSuiteOpts, TestingRunOpts } from './run-opts-model.js';
import { checkSnapshot } from './snapshot-creator.js';
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
  { actual: string; expected: string; message: string }
>;

const checkExpectationAndSnapshot = async (parameters: {
  opts: TestingRunOpts;
  response: ShellResponse;
  step: StepModel;
  useCase: UseCaseModel;
}): Promise<SnaphotResponse> => {
  const { opts, response, step, useCase } = parameters;
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

  let actual = getActualFromStdout(response, step.expect);

  if (actual === undefined) {
    return fail({ message: 'No actual defined', actual: '', expected: '' });
  }

  const normalizeEof = (text: string): string => {
    // Remove trailing blank lines (lines that are empty or whitespace only) and ensure a single final newline
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    let end = lines.length - 1;
    while (end >= 0 && /^\s*$/.test(lines[end] ?? '')) {
      end -= 1;
    }
    const trimmed = lines.slice(0, end + 1).join('\n');
    return `${trimmed}\n`;
  };

  const snapshotFileName = getSnapshotFilename(
    opts,
    useCase.name,
    step.expect.snapshot,
  );
  const existingSnapshotResult = await readSnapshotFile(snapshotFileName);
  let expected =
    existingSnapshotResult.status === 'success'
      ? existingSnapshotResult.value
      : undefined;

  if (step.expect.ignoreTrailingBlankLines === true) {
    actual = normalizeEof(actual);
    if (expected !== undefined) {
      expected = normalizeEof(expected);
    }
  }
  const compareResult = await checkSnapshot(actual, snapshotFileName, expected);
  return compareResult.status === 'success'
    ? succeed({ message: 'Matches existing snapshot' })
    : fail({
        message: compareResult.error.message,
        actual: compareResult.error.actual,
        expected: compareResult.error.expected,
      });
};

type ExecuteStepAndSnaphotResult = Result<string, string>;

const executeStepAndSnaphot = async (parameters: {
  opts: PestFileSuiteOpts;
  ctx: Context;
  step: StepModel;
  useCase: UseCaseModel;
}): Promise<ExecuteStepAndSnaphotResult> => {
  const { opts, ctx, step, useCase } = parameters;
  const { title } = step;
  const { specFile } = opts.runOpts;
  const snapshotFile =
    step.expect?.snapshot === undefined
      ? undefined
      : getSnapshotFilename(opts.runOpts, useCase.name, step.expect.snapshot);

  const reportingCaseDefault = {
    title,
    fullTitle: title,
    file: specFile,
    run: step.run,
    snapshotFile,
  };
  const started = Date.now();
  const stepResult = await executeStep(ctx, step);
  const duration = Date.now() - started;
  if (stepResult.status === 'success') {
    const snapshotResponse = await checkExpectationAndSnapshot({
      opts: opts.runOpts,
      step,
      response: stepResult.value.response,
      useCase,
    });
    if (snapshotResponse.status === 'success') {
      reportCaseStep(opts.reportTracker, {
        ...reportingCaseDefault,
        duration,
        err: { code: 'PASS' },
      });
      return succeed('Successful');
    }

    const { message, actual, expected } = snapshotResponse.error;
    reportCaseStep(opts.reportTracker, {
      ...reportingCaseDefault,
      duration,
      err: {
        code: 'ERR_ASSERTION',
        message,
        actual,
        expected,
        operator: 'strictEqual',
      },
    });
    return fail(message);
  }

  const snapshotResponse = await checkExpectationAndSnapshot({
    opts: opts.runOpts,
    step,
    response: stepResult.error.response,
    useCase,
  });
  if (snapshotResponse.status === 'success') {
    reportCaseStep(opts.reportTracker, {
      ...reportingCaseDefault,
      duration,
      err: { code: 'PASS' },
    });
    return succeed('Successful');
  }

  const { message, actual, expected } = snapshotResponse.error;
  const stepCommandMessage =
    stepResult.error.message ?? stepResult.error.response.stdouterr;
  reportCaseStep(opts.reportTracker, {
    ...reportingCaseDefault,
    duration,
    err: {
      code: 'ERR_ASSERTION',
      message: stepCommandMessage
        ? `${message}\n${stepCommandMessage}`
        : message,
      actual,
      expected,
      operator: 'strictEqual',
    },
  });
  return fail(message);
};

const runUseCase = async (parameters: {
  opts: PestFileSuiteOpts;
  ctx: Context;
  useCase: UseCaseModel;
}) => {
  const { opts, ctx, useCase } = parameters;
  ctx.steps.length = 0;
  reportStartSuite(
    `${opts.pestModel.title} - ${useCase.name}`,
    opts.runOpts.specFile,
  );
  let oneStepHasFailed = false;
  if (useCase.todo === undefined) {
    for (const step of useCase.steps) {
      if (oneStepHasFailed) {
        reportSkipped(step.title, 'A previous step has failed unexpectedly');
        continue;
      }

      // eslint-disable-next-line no-await-in-loop -- Steps must run sequentially to preserve context and snapshots
      const stepResult = await executeStepAndSnaphot({
        opts,
        ctx,
        step,
        useCase,
      });
      if (stepResult.status === 'failure') {
        oneStepHasFailed = true;
      }
    }
  } else {
    reportTodo(useCase.todo);
  }

  reportStopSuite();
};

export const runRegressionSuite = async (options: TestingRunOpts) => {
  const readingResult = await readYaml(options.specFile);
  const modelResult = andThen<
    Record<string, unknown>,
    PestModel,
    RunRegressionFailure
  >(safeParseBuild)(readingResult);

  if (modelResult.status === 'failure') {
    console.log(
      `Loading and parsing the baldrick-pest test file ${options.specFile} failed`,
      modelResult.error,
    );
    return;
  }

  if (modelResult.status === 'success') {
    const pestSuite: PestFileSuiteOpts = {
      reportTracker: createReportTracker(),
      pestModel: enhanceModel(modelResult.value),
      runOpts: options,
    };

    const ctx = {
      steps: [],
    };
    for (const [, useCase] of Object.entries(pestSuite.pestModel.cases)) {
      if (!useCase) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop -- Run use cases in sequence for stable reporting
      await runUseCase({ opts: pestSuite, ctx, useCase });
    }

    if (options.mochaJsonReport) {
      await reportMochaJson(pestSuite);
    }
  }
};
