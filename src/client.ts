import process from 'node:process';
import {Command} from 'commander';
import {runRegressionSuite} from './run-regression-suite.js';
import {version} from './version.js';

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
    .option('--spec-dir <directory>', 'Directory with the pest spec files', 'pest-spec')
    .option('--report-dir <directory>', 'Directory for the reports', 'report')
    .option('--snapshot-dir <directory>', 'Directory for the snapshots', 'pest-spec/snapshots')
    .option('--mocha-json-report', 'Enable mocha reports', true)
    .action(runRegressionSuite);

function normalizeLegacyFlags(argv: readonly string[]): string[] {
    // Back-compat: map old multi-letter short flags to long flags so existing scripts continue to work.
    const mapEqualForm = (arg: string, from: string, to: string) =>
        arg.startsWith(from + '=') ? to + arg.slice(from.length) : arg;

    const result: string[] = [];
    for (const a of argv) {
        if (a === '-dir') result.push('--spec-dir');
        else if (a === '-rep') result.push('--report-dir');
        else if (a === '-snap') result.push('--snapshot-dir');
        else if (a === '-mocha') result.push('--mocha-json-report');
        else result.push(a);
    }
    // Also handle forms like -dir=foo
    return result.map(a =>
        mapEqualForm(
            mapEqualForm(mapEqualForm(mapEqualForm(a, '-dir', '--spec-dir'), '-rep', '--report-dir'), '-snap', '--snapshot-dir'),
            '-mocha',
            '--mocha-json-report',
        ),
    );
}

export async function runClient() {
    try {
        const argv = normalizeLegacyFlags(process.argv);
        await program.parseAsync(argv);
        console.log(`✓ Done. Version ${version}`);
    } catch (error: unknown) {
        console.log('baldrick-pest will exit with error code 1');
        console.error(error);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
    }
}
