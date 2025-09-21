import { execaCommand } from 'execa';
import type { Context, ShellResponse } from './context.js';
import { getInputFromStdin } from './matching-step.js';
import type { StepModel } from './pest-model.js';
import type { Result } from './railway.js';
import { fail, succeed } from './railway.js';

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

const toStatus = (parameters: {
  exitCode: number;
  failed: boolean;
  isCanceled: boolean;
  timedOut: boolean;
  killed: boolean;
}): ExecuteCommandLineFailedCategory | 'success' => {
  const { exitCode, failed, isCanceled, timedOut, killed } = parameters;
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
  step: StepModel,
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

  const result = await execaCommand(run, {
    reject: false,
    ...maybeStdin,
    all: true,
  });
  // Execa v9 types are stricter; normalise optional fields with safe defaults.
  type R = Partial<{
    exitCode: number;
    failed: boolean;
    isCanceled: boolean;
    timedOut: boolean;
    killed: boolean;
    stdout: string;
    stderr: string;
    all: string;
  }>;
  const {
    exitCode: rawExitCode,
    failed: rawFailed,
    isCanceled: rawIsCanceled,
    timedOut: rawTimedOut,
    killed: rawKilled,
    stdout,
    stderr,
    all,
  } = result as unknown as R;

  const exitCode = rawExitCode ?? 0;
  const failed = Boolean(rawFailed);
  const isCanceled = Boolean(rawIsCanceled);
  const timedOut = Boolean(rawTimedOut);
  const killed = Boolean(rawKilled);

  const status = toStatus({
    exitCode,
    failed,
    isCanceled,
    timedOut,
    killed,
  });
  const response: ShellResponse = {
    exitCode,
    stdout,
    stderr,
    stdouterr: all,
  };
  ctx.steps.push(response);
  return status === 'success'
    ? succeed({ run, response })
    : fail({ category: status, run, response });
};
