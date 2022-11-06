import { diff } from 'jest-diff';
import { StepExecuteResult } from './execution-context-model.js';
import { writeSnapshotFile } from './snapshot-io.js';
import { Result, fail, succeed } from './railway.js';

type SnapshotResult = Result<
  string,
  {
    actual: string;
    expected: string;
    message: string;
  }
>;

export const checkSnapshot = async (
  executeResult: StepExecuteResult & { status: 'success' },
  snapshotFileName: string
): Promise<SnapshotResult> => {
  const expected = executeResult.value.context.expected;
  if (expected === undefined) {
    await writeSnapshotFile(snapshotFileName, executeResult.value.actual);
    return succeed(executeResult.value.actual);
  }

  const diffString = diff(expected, executeResult.value.actual);
  if (diffString === null) {
    return fail({
      actual: executeResult.value.actual,
      expected,
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
        expected,
        message: diffString,
      });
};
