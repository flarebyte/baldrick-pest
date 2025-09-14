// Keep this module independent from Zod v3/v4 internal types to avoid churn.

export type ValidationError = {
	message: string;
	path: string;
};
// Retained for compatibility with older formatters; not currently used.
// const safeValue = (value: unknown): string =>
// 	typeof value === 'string' ? value : JSON.stringify(value);

type IssueLike = {path: PropertyKey[]; code?: string; message?: string};

export const formatMessage = (issue: IssueLike): ValidationError => {
	const path = issue.path.map(String).join('.');
	// Zod v4 changed issue payload shapes. To remain forward-compatible and stable,
	// prefer the library-provided message and include the code for quick triage.
	const base = typeof issue.message === 'string' && issue.message.length > 0
		? issue.message
		: 'Validation error';
	const suffix = issue.code ? ` (code: ${issue.code})` : '';
	return {path, message: base + suffix};
};
