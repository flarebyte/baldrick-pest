import { ReportTracker } from './reporter-model.js';
import { PestModel } from './pest-model.js';

export interface TestingRunOpts {
  snapshotDir: string;
  specDir: string;
  reportDir: string;
  mochaJsonReport: boolean;
  specFile: string;
}

export interface PestFileSuiteOpts {
  reportTracker: ReportTracker;
  pestModel: PestModel;
  runOpts: TestingRunOpts;
}
