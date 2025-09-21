import type { PestModel } from './pest-model.js';
import type { ReportTracker } from './reporter-model.js';

export type TestingRunOpts = {
  snapshotDir: string;
  specDir: string;
  reportDir: string;
  mochaJsonReport: boolean;
  specFile: string;
};

export type PestFileSuiteOpts = {
  reportTracker: ReportTracker;
  pestModel: PestModel;
  runOpts: TestingRunOpts;
};
/* eslint unicorn/prevent-abbreviations: ["error", {"allowList": {"Opts": true, "opts": true}}] */
