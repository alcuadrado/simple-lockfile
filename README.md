# simple-lockfile

`simple-lockfile` is a straightforward lockfile implementation with zero dependencies. This minimalist package provides optimal functionality for applications that require exclusive lockfile acquisition before operating and prompt the user to manually resolve issues when failing to acquire it.

## Installation

Install simple-lockfile via npm using the following command:

```bash
npm install simple-lockfile
```

## Usage

The package exports a single function, `withLockfile`, which requires a path to a lockfile and a callback function. This callback is invoked only if the lockfile is successfully acquired.

The callback function provided to `withLockfile` must be designed not to throw exceptions. If it does and `withLockfile` fails to delete the lockfile, you won't be able to retrieve your exception.

Below is a sample usage of `simple-lockfile`:

```typescript
import process from "process";
import { withLockfile, LockfileAlreadyExistedError } from "simple-lockfile";

try {
  withLockfile("my-app.lockfile", () => {
    try {
      foo();
    } catch (error) {
      console.error("my-app failed", error);
    }
  });
} catch (error) {
  if (error instanceof LockfileAlreadyExistedError) {
    console.error(`Unable to acquire the necessary lockfile (my-app.lockfile) to run my-app.

Please ensure no other instance of my-app is currently running and try again.

If the problem persists, manually delete my-app.lockfile and reattempt.
`);
    process.exit(1);
  }

  throw error;
}
```

Refer to the `withLockfile` function documentation for more details on the exceptions it may throw.

## Limitations

Please note the following constraints associated with `simple-lockfile`:

- Lockfiles do not expire. In case a process inadvertently leaves a lockfile, it must be manually deleted by the user.
- The `withLockfile` function attempts to acquire the lockfile only once without any retries.
- This module may not function properly with the [Network File System (NFS)](https://en.wikipedia.org/wiki/Network_File_System). For NFS support, consider using `proper-lockfile`.
