import { Context, ShellResponse } from './context.js';
import { ExitCodeModel, ExpectModel, StdinModel } from './pest-model.js';
import { Result, succeed, fail } from './railway.js';

export const matchExitCode = (
  actual: number,
  expected: ExitCodeModel
): boolean => {
  switch (expected) {
    case 'any':
      return true;
    case 'exit 0':
      return actual === 0;
    case 'exit 1 .. n':
      return actual >= 1;
  }
};

type InputStdinResult = Result<string, { message: string }>;
export const getInputFromStdin = (
  ctx: Context,
  stdin: StdinModel
): InputStdinResult => {
  const { receiving, step } = stdin;
  if (step >= ctx.steps.length) {
    return fail({
      message: `At this stage we have run only ${ctx.steps.length} step(s) but trying to read step at index ${step} (832276)`,
    });
  }
  const stepValue = ctx.steps[step];
  if (stepValue === undefined) {
    return fail({ message: `Step ${step} has no defined output  (411665)` });
  }
  if (!matchExitCode(stepValue.exitCode, stdin.exitCode)) {
    return fail({
      message: `Was expecting ${stdin.exitCode} but go ${stepValue.exitCode} (822595)`,
    });
  }
  switch (receiving) {
    case 'stdout':
      return succeed(stepValue.stdout || '');
    case 'stderr':
      return succeed(stepValue.stderr || '');
    case 'stdout + stderr':
      return succeed(stepValue.stdouterr || '');
  }
};

export const getActualFromStdout = (
  response: ShellResponse,
  expectation: ExpectModel
): string | undefined => {
  switch (expectation.capture) {
    case 'stdout':
      return response.stdout;
    case 'stderr':
      return response.stderr;
    case 'stdout + stderr':
      return response.stdouterr;
  }
};
