import { unlinkSync } from "fs";
import { createFileSync } from "./create-file";

/**
 * This error is thrown if a lockfile is already present at the time of creation.
 */
export class LockfileAlreadyExistedError extends Error {
  constructor(lockfilePath: string) {
    super(`Lockfile ${lockfilePath} already exists`);
  }
}

/**
 * This error is thrown if the lockfile doesn't exist but it still can't be acquired.
 */
export class CouldNotAcquireLockfileError extends Error {
  constructor(lockfilePath: string, cause: Error) {
    //@ts-ignore @types/node@^12 doesn't include cause. This can be removed once Node <16 support is dropped.
    super(`Could not aquire lockfile ${lockfilePath}`, { cause });
  }
}

/**
 * This error is thrown if there's an issue when trying to delete the lockfile.
 */
export class CouldNotReleaseLockfileError extends Error {
  constructor(lockfilePath: string, cause: Error) {
    //@ts-ignore @types/node@^12 doesn't include cause. This can be removed once Node <16 support is dropped.
    super(`Could not release lockfile ${lockfilePath}`, { cause });
  }
}

/**
 * Executes the criticalSection function if and only if the lockfile is successfully acquired.
 *
 * This function will throw a `LockfileAlreadyExistedError` if the lockfile already exists.
 *
 * If the lockfile doesn't exist but can't be acquired, it will throw a `CouldNotAcquireLockfileError`.
 *
 * If the lockfile can't be released (e.g., if it has been manually deleted), it will throw a
 * `CouldNotReleaseLockfileError`. Depending on your criticalSection, you may choose to ignore
 * this error, attempt to recover from it, or inform your users about it.
 *
 * @param {string} pathToLockfile - The path to the lockfile.
 * @param {() => void} criticalSection - The operation that needs to be executed under the protection of the lockfile.
 */
export function withLockfile(
  pathToLockfile: string,
  criticalSection: () => void
) {
  try {
    createFileSync(pathToLockfile);
  } catch (error) {
    ensureError(error);

    if ("code" in error && error.code === "EEXIST") {
      throw new LockfileAlreadyExistedError(pathToLockfile);
    }

    throw new CouldNotAcquireLockfileError(pathToLockfile, error);
  }

  try {
    criticalSection();
  } finally {
    try {
      unlinkSync(pathToLockfile);
    } catch (error) {
      ensureError(error);

      throw new CouldNotReleaseLockfileError(pathToLockfile, error);
    }
  }
}

function ensureError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw error;
  }
}
