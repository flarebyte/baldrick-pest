type Success<T> = {
	status: 'success';
	value: T;
};
type Failure<E> = {
	status: 'failure';
	error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;

/**
 * Return a successful response
 */
export const succeed = <T>(value: T): Success<T> => ({
	status: 'success',
	value,
});

/**
 * Return a failure result
 */
export const fail = <E>(error: E): Failure<E> => ({status: 'failure', error});

export const withDefault = <T, E>(defaultValue: T) =>
	(result: Result<T, E>): T =>
		result.status === 'success' ? result.value : defaultValue;

export const map1 = <T, U, E>(fn: (value: T) => U) =>
	(result: Result<T, E>): Result<U, E> =>
		result.status === 'success' ? succeed(fn(result.value)) : result;

export const andThen = <T, U, E>(fn: (value: T) => Result<U, E>) =>
	(result: Result<T, E>): Result<U, E> =>
		result.status === 'success' ? fn(result.value) : result;
