import { execaCommand } from 'execa';
import { Context } from './context.js';
import { ExitCodeModel, StdinModel, StepModel } from './pest-model.js';
import { Result, succeed, fail } from './railway.js';

type ExecuteCommandLineFailedCategory =
  | 'failed'
  | 'canceled'
  | 'timeout'
  | 'killed';

type ExecuteCommandLineFailure = {
  category: ExecuteCommandLineFailedCategory;
  run: string;
};

type ExecuteCommandLineSuccess = {
  run: string;
};
type ExecuteCommandLineResult = Result<
  ExecuteCommandLineSuccess,
  ExecuteCommandLineFailure
>;

const toStatus = (params: {
  exitCode: number;
  failed: boolean;
  isCanceled: boolean;
  timedOut: boolean;
  killed: boolean;
}): ExecuteCommandLineFailedCategory | 'success' => {
  const { exitCode, failed, isCanceled, timedOut, killed } = params;
  if (failed) {
    return 'failed';
  }
  if (isCanceled) {
    return 'canceled';
  }
  if (timedOut) {
    return 'timeout';
  }
  if (killed) {
    return 'killed';
  }
  if (exitCode > 0) {
    return 'failed';
  }
  return 'success';
};

const matchExitCode = (actual: number, expected: ExitCodeModel): boolean => {
  switch (expected) {
    case 'any':
      return true;
    case 'exit 0':
      return actual === 0;
    case 'exit 1 .. n':
      return actual >= 1;
  }
};

const getInputFromStdin = (
  ctx: Context,
  stdin: StdinModel
): string | undefined => {
  const { receiving, step } = stdin;
  if (step >= ctx.steps.length) {
    return undefined;
  }
  const stepValue = ctx.steps[step];
  if (stepValue === undefined) {
    return undefined;
  }
  if (!matchExitCode(stepValue.exitCode, stdin.exitCode)) {
    return undefined;
  }
  switch (receiving) {
    case 'stdout':
      return stepValue.stdout;
    case 'stderr':
      return stepValue.stderr;
    case 'stdout + stderr':
      return stepValue.stdouterr;
  }
};

export const executeStep = async (
  ctx: Context,
  step: StepModel
): Promise<ExecuteCommandLineResult> => {
  const { run, stdin } = step;

  const maybeStdin =
    stdin === undefined ? {} : { input: getInputFromStdin(ctx, stdin) };

  const {
    stdout,
    stderr,
    all,
    exitCode,
    failed,
    isCanceled,
    timedOut,
    killed,
  } = await execaCommand(run, { reject: false, ...maybeStdin, all: true });

  const status = toStatus({ exitCode, failed, isCanceled, timedOut, killed });

  if (status === 'success') {
    ctx.steps.push({ exitCode, stdout, stderr, stdouterr: all });
    return succeed({ run });
  } else {
    ctx.steps.push({ exitCode, stdout, stderr, stdouterr: all });
    return fail({ category: status, run });
  }
};
