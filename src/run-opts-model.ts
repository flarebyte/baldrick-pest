import {type ReportTracker} from './reporter-model.js';
import {type PestModel} from './pest-model.js';

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
