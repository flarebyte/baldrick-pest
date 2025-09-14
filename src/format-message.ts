import {type z} from 'zod';

export type ValidationError = {
	message: string;
	path: string;
};
const safeValue = (value: unknown): string =>
	typeof value === 'string' ? value : JSON.stringify(value);

export const formatMessage = (issue: z.ZodIssue): ValidationError => {
	const path = issue.path.join('.');
	if (issue.code === 'invalid_type') {
		return {
			path,
			message: [
				'The type for the field is invalid',
				`I would expect ${safeValue(issue.expected)} instead of ${safeValue(issue.received)}`,
			].join('; '),
		};
	}

	if (issue.code === 'invalid_string') {
		return {
			path,
			message: [
				'The string for the field is invalid',
				`${issue.message} and ${safeValue(issue.validation)}`,
			].join('; '),
		};
	}

	if (issue.code === 'invalid_enum_value') {
		return {
			path,
			message: [
				'The enum for the field is invalid',
				`I would expect any of ${issue.options.join(', ')} instead of ${safeValue(issue.received)}`,
			].join('; '),
		};
	}

	if (issue.code === 'invalid_literal') {
		return {
			path,
			message: [
				'The literal for the field is invalid',
				`I would expect ${safeValue(issue.expected)}`,
			].join('; '),
		};
	}

	if (issue.code === 'invalid_union_discriminator') {
		return {
			path,
			message: [
				'The union discriminator for the object is invalid',
				`I would expect any of ${issue.options.join(', ')}`,
			].join('; '),
		};
	}

	if (issue.code === 'invalid_union') {
		return {
			path,
			message: [
				'The union for the field is invalid',
				`I would check ${issue.unionErrors
					.flatMap(error => error.issues)
					.map(i => i.message)
					.join(', ')}`,
			].join('; '),
		};
	}

	if (issue.code === 'too_big') {
		return {
			path,
			message: [
				`The ${issue.type} for the field is too big`,
				`I would expect the maximum to be ${issue.maximum}`,
			].join('; '),
		};
	}

	if (issue.code === 'too_small') {
		return {
			path,
			message: [
				`The ${issue.type} for the field is too small`,
				`I would expect the minimum to be ${issue.minimum}`,
			].join('; '),
		};
	}

	return {
		path,
		message: [
			'The type for the field is incorrect',
			`${issue.message}`,
		].join('; '),
	};
};
