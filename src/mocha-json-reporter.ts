import {dirname} from 'node:path';
import {mkdir, writeFile} from 'node:fs/promises';
import {getMochaFilename} from './naming.js';
import {type FullReport} from './reporter-model.js';
import {type PestFileSuiteOpts} from './run-opts-model.js';

const expandReportTracker = (options: PestFileSuiteOpts): FullReport => {
	const passes = options.reportTracker.tests.filter(
		test => test.err.code === 'PASS',
	);
	const failures = options.reportTracker.tests.filter(
		test => test.err.code !== 'PASS',
	);
	const duration = options.reportTracker.tests.reduce(
		(sum, t) => sum + t.duration,
		0,
	);
	return {
		stats: {
			...options.reportTracker.stats,
			end: new Date().toISOString(),
			passes: passes.length,
			failures: failures.length,
			duration,
		},
		tests: [...options.reportTracker.tests],
		passes,
		failures,
		pending: [],
	};
};

export const reportMochaJson = async (options: PestFileSuiteOpts) => {
	const reportFilename = getMochaFilename(options.runOpts);
	await mkdir(dirname(reportFilename), {recursive: true});
	const fullReport = expandReportTracker(options);
	await writeFile(reportFilename, JSON.stringify(fullReport, null, 2), {
		encoding: 'utf8',
	});
};
