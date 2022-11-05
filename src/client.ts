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
  .argument('<target>', 'The path to the target pest file')
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