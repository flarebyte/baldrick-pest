import process from 'node:process';
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
    'pest-spec/index.pest.yaml',
  )
  // Preserve user-facing long flags; short multi-letter flags were never valid in commander.
  .option(
    '--spec-dir <directory>',
    'Directory with the pest spec files',
    'pest-spec',
  )
  .option('--report-dir <directory>', 'Directory for the reports', 'report')
  .option(
    '--snapshot-dir <directory>',
    'Directory for the snapshots',
    'pest-spec/snapshots',
  )
  .option('--mocha-json-report', 'Enable mocha reports', true)
  .action(runRegressionSuite);

function guardLegacyFlags(argv: readonly string[]): void {
  const legacy = [
    { short: '-dir', long: '--spec-dir <directory>' },
    { short: '-rep', long: '--report-dir <directory>' },
    { short: '-snap', long: '--snapshot-dir <directory>' },
    { short: '-mocha', long: '--mocha-json-report' },
  ];
  const offenders: string[] = [];
  for (const a of argv) {
    for (const { short } of legacy) {
      if (a === short || a.startsWith(`${short}=`)) {
        offenders.push(a);
      }
    }
  }
  if (offenders.length > 0) {
    const hints = legacy
      .map(({ short, long }) => `  - ${short} → use ${long}`)
      .join('\n');
    const message = [
      'Error: Unsupported short flags detected:',
      `  ${offenders.join(', ')}`,
      '',
      'Commander only supports single-letter short flags. Use the long options instead:',
      hints,
      '',
      'Examples:',
      '  baldrick-pest test --spec-dir pest-spec --report-dir report',
      '  baldrick-pest test --snapshot-dir pest-spec/snapshots --mocha-json-report',
    ].join('\n');
    // eslint-disable-next-line no-console
    console.error(message);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

export async function runClient() {
  try {
    const argv = process.argv;
    guardLegacyFlags(argv);
    await program.parseAsync(argv);
    console.log(`✓ Done. Version ${version}`);
  } catch (error: unknown) {
    console.log('baldrick-pest will exit with error code 1');
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}
