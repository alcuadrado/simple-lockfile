import { openSync, constants, closeSync } from "fs";

/**
 * Creates a file in a synchronous way, waiting for its (empty) contents
 * and metadata to be flushed, and trying to avoid any caching.
 *
 * Note that this method calls `openSync` internally and doesn't handle
 * any of its errors.
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
