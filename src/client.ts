import { Command } from 'commander';
import { runRegressionSuite } from './run-regression-suite.js';
import { version } from './version.js';

const program = new Command();
program
  .name('baldrick-pest')
  .description('CLI to run shell regression tests')
  .version(version);

program
  .command('test')
  .description('Run regression test')
  .option(
    '-f, --spec-file <filename>',
    'Test file in baldrick-pest YAML format',
    'pest-spec/index.pest.yaml'
  )
  .option(
    '-dir, --spec-dir <directory>',
    'Directory with the pest spec files',
    'pest-spec'
  )
  .option(
    '-rep, --report-dir <directory>',
    'Directory for the reports',
    'report'
  )
  .option(
    '-snap, --snapshot-dir <directory>',
    'Directory for the snapshots',
    'pest-spec/snapshots'
  )
  .option('-mocha, --mocha-json-report', 'Enable mocha reports', true)
  .action(runRegressionSuite);

export async function runClient() {
  try {
    program.parseAsync();
    console.log(`✓ Done. Version ${version}`);
  } catch (error) {
    console.log('baldrick-pest will exit with error code 1');
    console.error(error);
    process.exit(1); // eslint-disable-line  unicorn/no-process-exit
  }
}
