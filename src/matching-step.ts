import { Context, ShellResponse } from './context.js';
import { ExitCodeModel, ExpectModel, StdinModel } from './pest-model.js';

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
export const getInputFromStdin = (
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
