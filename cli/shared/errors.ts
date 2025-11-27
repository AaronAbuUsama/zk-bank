// ============================================================================
// Result Type & Utilities
// ============================================================================

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Wrap an async operation and return a discriminated union containing either
 * the resolved value or the captured error. Keeps call sites free from
 * try/catch blocks and encourages explicit handling of both outcomes.
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

/**
 * Synchronous counterpart to tryCatch; evaluate a function and return
 * its value or the thrown error without bubbling exceptions.
 */
export function tryCatchSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
