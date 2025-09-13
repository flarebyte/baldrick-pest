import {
	ciReportStepCase,
	ciReportSkipped,
	ciReportStartSuite,
	ciReportTodo,
} from './ci-reporter.js';
import {isCI} from './is-ci.js';
import {
	prettyReportStepCase,
	prettyReportSkipped,
	prettyReportStartSuite,
	prettyReportTodo,
} from './pretty-reporter.js';
import {type ReportingCase, type ReportTracker} from './reporter-model.js';

export const reportStartSuite = (title: string, secondary: string) => {
	isCI
		? ciReportStartSuite(title, secondary)
		: prettyReportStartSuite(title, secondary);
};

export const reportStopSuite = () => {
	console.groupEnd();
};

export const reportCaseStep = (
	reportTracker: ReportTracker,
	reportingCase: ReportingCase,
) => {
	const duration = Date.now() - reportTracker.stats.duration;
	reportTracker.tests.push({...reportingCase, duration});
	isCI
		? ciReportStepCase(reportingCase)
		: prettyReportStepCase(reportingCase);
};

export const reportTodo = (title: string) => {
	isCI ? ciReportTodo(title) : prettyReportTodo(title);
};

export const reportSkipped = (title: string, reason: string) => {
	isCI ? ciReportSkipped(title, reason) : prettyReportSkipped(title, reason);
};
