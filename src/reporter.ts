import {
  ciReportSkipped,
  ciReportStartSuite,
  ciReportStepCase,
  ciReportTodo,
} from './ci-reporter.js';
import { isCi } from './is-ci.js';
import {
  prettyReportSkipped,
  prettyReportStartSuite,
  prettyReportStepCase,
  prettyReportTodo,
} from './pretty-reporter.js';
import type { ReportingCase, ReportTracker } from './reporter-model.js';

export const reportStartSuite = (title: string, secondary: string) => {
  if (isCi) {
    ciReportStartSuite(title, secondary);
  } else {
    prettyReportStartSuite(title, secondary);
  }
};

export const reportStopSuite = () => {
  console.groupEnd();
};

export const reportCaseStep = (
  reportTracker: ReportTracker,
  reportingCase: ReportingCase,
) => {
  const duration = Date.now() - reportTracker.stats.duration;
  reportTracker.tests.push({ ...reportingCase, duration });
  if (isCi) {
    ciReportStepCase(reportingCase);
  } else {
    prettyReportStepCase(reportingCase);
  }
};

export const reportTodo = (title: string) => {
  if (isCi) {
    ciReportTodo(title);
  } else {
    prettyReportTodo(title);
  }
};

export const reportSkipped = (title: string, reason: string) => {
  if (isCi) {
    ciReportSkipped(title, reason);
  } else {
    prettyReportSkipped(title, reason);
  }
};
