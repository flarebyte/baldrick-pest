import {readFile} from 'node:fs/promises';
import winston from 'winston';

const {printf} = winston.format;
const consoleLikeFormat = printf(({message}) => message);

export const currentTaskLogger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.File({
			filename: 'temp/log/baldrick-broth-log.txt',
			options: {flags: 'w'},
			format: consoleLikeFormat,
		}),
	],
});

export const telemetryTaskLogger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.File({
			filename: 'temp/log/baldrick-broth-telemetry.csv',
			format: consoleLikeFormat,
		}),
	],
});

export const telemetryTaskRefLogger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.File({
			filename: 'temp/log/baldrick-broth-telemetry-ref.csv',
			format: consoleLikeFormat,
		}),
	],
});

export const replayLogToConsole = async () => {
	try {
		const currentLog = await readFile('temp/log/baldrick-broth-log.txt', {
			encoding: 'utf8',
		});
		console.log(['', '', currentLog].join('\n'));
	} catch (error: any) {
		console.error('Could not replay the log', error);
	}
};
