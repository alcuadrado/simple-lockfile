import { unlinkSync } from "fs";
import { createFileSync } from "./create-file";

/**
 * An error thrown when the lockfile already existed.
 */
export class LockfileAlreadyExistedError extends Error {
  constructor(lockfilePath: string) {
    super(`Lockfile ${lockfilePath} already exists`);
  }
}

/**
 * An error thrown when the lockfile could not be acquired despite
 * it not existing.
 */
export class CouldNotAcquireLockfileError extends Error {
  constructor(lockfilePath: string, cause: Error) {
    //@ts-ignore @types/node@^12 doesn't include cause. This can be removed once Node <16 support is dropped.
    super(`Could not aquire lockfile ${lockfilePath}`, { cause });
  }
}

/**
 * An error thrown when the release of the lockfile failed.
 */
export class CouldNotReleaseLockfileError extends Error {
  constructor(lockfilePath: string, cause: Error) {
    //@ts-ignore @types/node@^12 doesn't include cause. This can be removed once Node <16 support is dropped.
    super(`Could not release lockfile ${lockfilePath}`, { cause });
  }
}

/**
 * Calls the criticalSection function only if and only if the lockfile was acquired.
 *
 * If the lockfile already existed it will not be acquired and a
 * LockfileAlreadyExistedError exception will be thrown.
 *
 * If the lockfile doesn't exist and it can't be acquired, a
 * CouldNotAcquireLockfileError exception will be thrown.
 *
 * If the lokcfile can't be released (e.g. the user deleted it manually) a
 * CouldNotReleaseLockfileError exception will be thrown. Depending on your
 * criticalSection you may ignore this error, try to recover from it, or
 * inform your users about it.
 *
 * @param pathToLockfile The path to the lockfile.
 * @param criticalSection The operation protected by the lockfile.
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
