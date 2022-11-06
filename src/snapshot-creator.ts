import { diff } from 'jest-diff';
import { StepExecuteResult } from './execution-context-model.js';
import { writeSnapshotFile } from './snapshot-io.js';
import { Result, fail, succeed } from './railway.js';

type SnapshotResult = Result<
  string | object,
  {
    actual: string | object;
    expected: string | object;
    message: string;
  }
>;

export const checkSnapshot = async (
  executeResult: StepExecuteResult & { status: 'success' },
  snapshotFileName: string,
): Promise<SnapshotResult> => {
  if (executeResult.value.context.expected === undefined) {
    await writeSnapshotFile(
      snapshotFileName,
      executeResult.value.actual,

    );
    return succeed(executeResult.value.actual);
  }

  const isSameType =
    (typeof executeResult.value.context.expected === 'string' &&
      typeof executeResult.value.actual === 'string') ||
    (typeof executeResult.value.context.expected === 'object' &&
      typeof executeResult.value.actual === 'object');
  if (isSameType) {
    const diffString = diff(
      executeResult.value.context.expected,
      executeResult.value.actual
    );
    if (diffString === null) {
      return succeed({
        actual: executeResult.value.actual,
        expected: executeResult.value.context.expected,
        message: 'Comparison with a null value',
      });
    }
    const hasNoDifference = diffString.includes(
      'Compared values have no visual difference'
    );
    return hasNoDifference
      ? succeed(executeResult.value.actual)
      : fail({
          actual: executeResult.value.actual,
          expected: executeResult.value.context.expected,
          message: diffString,
        });
  }

  return fail({
    actual: executeResult.value.actual,
    expected: executeResult.value.context.expected,
    message: 'Types for actual and expected are different',
  });
};
