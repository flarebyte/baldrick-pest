import { execaCommand } from 'execa';
import { Context, ShellResponse } from './context.js';
import { getInputFromStdin } from './matching-step.js';
import { StepModel } from './pest-model.js';
import { Result, succeed, fail } from './railway.js';

type ExecuteCommandLineFailedCategory =
  | 'failed'
  | 'canceled'
  | 'timeout'
  | 'killed';

type ExecuteCommandLineFailure = {
  category: ExecuteCommandLineFailedCategory;
  run: string;
  response: ShellResponse;
};

type ExecuteCommandLineSuccess = {
  run: string;
  response: ShellResponse;
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
  const response: ShellResponse = { exitCode, stdout, stderr, stdouterr: all };
  ctx.steps.push(response);
  if (status === 'success') {
    return succeed({ run, response });
  } else {
    return fail({ category: status, run, response });
  }
};
