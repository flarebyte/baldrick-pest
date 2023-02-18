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
  message?: string;
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

  let maybeStdin = {};
  if (stdin !== undefined) {
    const stdinInputResult = getInputFromStdin(ctx, stdin);
    if (stdinInputResult.status === 'success') {
      maybeStdin = { input: stdinInputResult.value };
    } else {
      return fail({
        category: 'failed',
        run,
        response: { exitCode: 6637 },
        message: stdinInputResult.error.message,
      });
    }
  }

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
  return status === 'success'
    ? succeed({ run, response })
    : fail({ category: status, run, response });
};
