import { diff } from 'jest-diff';
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
  actual: string,
  snapshotFileName: string,
  expected?: string,
): Promise<SnapshotResult> => {
  if (expected === undefined) {
    await writeSnapshotFile(snapshotFileName, actual);
    return succeed(actual);
  }

  const diffString = diff(expected, actual);
  if (diffString === null) {
    return fail({
      actual,
      expected,
      message: 'Comparison with a null value',
    });
  }
  const hasNoDifference = diffString.includes(
    'Compared values have no visual difference'
  );
  return hasNoDifference
    ? succeed(actual)
    : fail({
        actual,
        expected,
        message: diffString,
      });
};
