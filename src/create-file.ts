import { openSync, constants, closeSync } from "fs";

/**
 * Synchronously creates an empty file with flushed metadata, minimizing caching.
 *
 * This function works by calling `openSync` internally, which sets certain flags to define the file's creation and access behavior.
 *
 * It's important to note that this function does not handle any errors thrown by `openSync`. Therefore, users should be prepared to handle any potential file system errors that may arise.
 *
 * @param path - The string representing the path where the file should be created.
 *
 * @example
 * ```
 * import { createFileSync } from '...';
 *
 * createFileSync('./path/to/new/file');
 * ```
 */
export function createFileSync(path: string) {
  const openFlags =
    constants.O_CREAT | // Create it if it doesn't exist
    constants.O_EXCL | // Fail if it exists
    constants.O_DSYNC | // Synchronous I/O waiting for writes of content and metadata
    constants.O_DIRECT; // Minimize caching

  const fd = openSync(path, openFlags);
  closeSync(fd);
}
