# Internal

> Overview of the code base of baldrick-pest

This document has been generated automatically by
[baldrick-doc-ts](https://github.com/flarebyte/baldrick-doc-ts)

## Diagram of the dependencies

```mermaid
classDiagram
class `ci-reporter.ts`{
  +ciReportStartSuite()
  +ciReportStepCase()
  +ciReportTodo()
  +ciReportSkipped()
}
class `client.ts`{
  +runClient()
}
class `context.ts`
class `execution.ts`{
  - toStatus()
  +executeStep()
}
class `field-validation.ts`{
  - isSingleLine()
  +safeParseField()
}
class `format-message.ts`{
  +formatMessage()
}
class `index.ts`
class `is-ci.ts`
class `logging.ts`{
  - consoleLikeFormat()
  +replayLogToConsole()
}
class `matching-step.ts`{
  +matchExitCode()
  +getInputFromStdin()
  +getActualFromStdout()
}
class `mocha-json-reporter.ts`{
  - expandReportTracker()
  +reportMochaJson()
}
class `model-enhancer.ts`{
  +enhanceModel()
}
class `naming.ts`{
  +getSnapshotFilename()
  +getMochaFilename()
}
class `pest-file-io.ts`{
  +readYaml()
}
class `pest-model.ts`{
  +safeParseBuild()
  +getSchema()
}
class `pretty-reporter.ts`{
  +prettyReportStartSuite()
  +prettyReportTodo()
  +prettyReportSkipped()
  - addSnapshot()
  - addRun()
  +prettyReportStepCase()
}
class `railway.ts`{
  +succeed()
  +fail()
  +withDefault()
  +map1()
  +andThen()
}
class `reporter-model.ts`
class `reporter.ts`{
  +reportStartSuite()
  +reportStopSuite()
  +reportCaseStep()
  +reportTodo()
  +reportSkipped()
}
class `run-opts-model.ts`
class `run-regression-suite.ts`{
  - createReportTracker()
  - checkExpectationAndSnapshot()
  - executeStepAndSnaphot()
  - runUseCase()
  +runRegressionSuite()
}
class `snapshot-creator.ts`{
  +checkSnapshot()
}
class `snapshot-io.ts`{
  +readSnapshotFile()
  +writeSnapshotFile()
}
class `version.ts`
class `./reporter-model.js`{
  +ReportTracker()
  +ReportingCase()
  +FullReport()
}
class `commander`{
  +Command()
}
class `./run-regression-suite.js`{
  +runRegressionSuite()
}
class `./version.js`{
  +version()
}
class `execa`{
  +execaCommand()
}
class `./context.js`{
  +ShellResponse()
  +Context()
}
class `./matching-step.js`{
  +matchExitCode()
  +getActualFromStdout()
  +getInputFromStdin()
}
class `./pest-model.js`{
  +UseCaseModel()
  +StepModel()
  +safeParseBuild()
  +PestModel()
  +StdinModel()
  +ExpectModel()
  +ExitCodeModel()
}
class `./railway.js`{
  +succeed()
  +fail()
  +Result()
  +andThen()
}
class `zod`{
  +z()
}
class `node:fs/promises`{
  +writeFile()
  +readFile()
  +mkdir()
  +fs()
}
class `winston`{
  +winston()
}
class `node:path`{
  +dirname()
  +basename()
  +join()
  +relative()
}
class `./naming.js`{
  +getSnapshotFilename()
  +getMochaFilename()
}
class `./run-opts-model.js`{
  +TestingRunOpts()
  +PestFileSuiteOpts()
}
class `yaml`{
  +YAML()
}
class `./field-validation.js`{
  +stringy()
}
class `./format-message.js`{
  +ValidationError()
  +formatMessage()
}
class `chalk`{
  +Chalk()
}
class `./ci-reporter.js`{
  +ciReportTodo()
  +ciReportStartSuite()
  +ciReportSkipped()
  +ciReportStepCase()
}
class `./is-ci.js`{
  +isCI()
}
class `./pretty-reporter.js`{
  +prettyReportTodo()
  +prettyReportStartSuite()
  +prettyReportSkipped()
  +prettyReportStepCase()
}
class `./execution.js`{
  +executeStep()
}
class `./mocha-json-reporter.js`{
  +reportMochaJson()
}
class `./model-enhancer.js`{
  +enhanceModel()
}
class `./pest-file-io.js`{
  +readYaml()
}
class `./reporter.js`{
  +reportTodo()
  +reportStopSuite()
  +reportStartSuite()
  +reportSkipped()
  +reportCaseStep()
}
class `./snapshot-creator.js`{
  +checkSnapshot()
}
class `./snapshot-io.js`{
  +writeSnapshotFile()
  +readSnapshotFile()
}
class `jest-diff`{
  +diff()
}
`ci-reporter.ts`-->`./reporter-model.js`
`client.ts`-->`commander`
`client.ts`-->`./run-regression-suite.js`
`client.ts`-->`./version.js`
`execution.ts`-->`execa`
`execution.ts`-->`./context.js`
`execution.ts`-->`./matching-step.js`
`execution.ts`-->`./pest-model.js`
`execution.ts`-->`./railway.js`
`field-validation.ts`-->`zod`
`format-message.ts`-->`zod`
`logging.ts`-->`node:fs/promises`
`logging.ts`-->`winston`
`matching-step.ts`-->`./context.js`
`matching-step.ts`-->`./pest-model.js`
`matching-step.ts`-->`./railway.js`
`mocha-json-reporter.ts`-->`node:path`
`mocha-json-reporter.ts`-->`node:fs/promises`
`mocha-json-reporter.ts`-->`./naming.js`
`mocha-json-reporter.ts`-->`./reporter-model.js`
`mocha-json-reporter.ts`-->`./run-opts-model.js`
`model-enhancer.ts`-->`./pest-model.js`
`naming.ts`-->`node:path`
`naming.ts`-->`./run-opts-model.js`
`pest-file-io.ts`-->`yaml`
`pest-file-io.ts`-->`node:fs/promises`
`pest-file-io.ts`-->`./railway.js`
`pest-model.ts`-->`zod`
`pest-model.ts`-->`./field-validation.js`
`pest-model.ts`-->`./format-message.js`
`pest-model.ts`-->`./railway.js`
`pretty-reporter.ts`-->`./reporter-model.js`
`pretty-reporter.ts`-->`chalk`
`reporter.ts`-->`./ci-reporter.js`
`reporter.ts`-->`./is-ci.js`
`reporter.ts`-->`./pretty-reporter.js`
`reporter.ts`-->`./reporter-model.js`
`run-opts-model.ts`-->`./reporter-model.js`
`run-opts-model.ts`-->`./pest-model.js`
`run-regression-suite.ts`-->`./context.js`
`run-regression-suite.ts`-->`./execution.js`
`run-regression-suite.ts`-->`./format-message.js`
`run-regression-suite.ts`-->`./matching-step.js`
`run-regression-suite.ts`-->`./mocha-json-reporter.js`
`run-regression-suite.ts`-->`./model-enhancer.js`
`run-regression-suite.ts`-->`./naming.js`
`run-regression-suite.ts`-->`./pest-file-io.js`
`run-regression-suite.ts`-->`./pest-model.js`
`run-regression-suite.ts`-->`./railway.js`
`run-regression-suite.ts`-->`./reporter-model.js`
`run-regression-suite.ts`-->`./reporter.js`
`run-regression-suite.ts`-->`./run-opts-model.js`
`run-regression-suite.ts`-->`./snapshot-creator.js`
`run-regression-suite.ts`-->`./snapshot-io.js`
`snapshot-creator.ts`-->`jest-diff`
`snapshot-creator.ts`-->`./snapshot-io.js`
`snapshot-creator.ts`-->`./railway.js`
`snapshot-io.ts`-->`node:path`
`snapshot-io.ts`-->`node:fs/promises`
`snapshot-io.ts`-->`./railway.js`
```
