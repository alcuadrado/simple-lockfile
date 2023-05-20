# simple-lockfile

An implementation of a lockfile that strives to be as simlpe as possible, with 0 dependencies.

This package is ideal for applications don't perform any functionality if they can't acquire a lockfile, and ask the user to fix the situation.

## Install

```bash
npm install simple-lockfile
```

## Usage

This module exports a single function, `withLockfile`, that takes a path to a lockfile and a function that should be run if and only if the lockfile is acquired.

The function you pass to `withLockfile` shouldn't throw. If it does and `withLockfile` can't delete the lockfile, your exception won't be accessible.

Here's an example of how to use it correctly:

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
    console.error(`Could not acquire the lockfile my-app.lockfile that's needed to run my-app.

Make sure you aren't running another instance of my-app and try again.

If this error presists, delete my-app.lockfile and try again.
`);
    process.exit(1);
  }

  throw error;
}
```

See `withLockfile`'s documentation to learn about the different exceptions that it throws.

## Limitations

This package has the following limitations:

- Lockfiles do not expire. If a process accidentally leaves an existing lockfile, the user will need to delete it.
- `withLockfile` only tries to acquire the lockfile once, without any retry.
- This module may not work on [NFS](https://en.wikipedia.org/wiki/Network_File_System). See [`proper-lockfile`](https://www.npmjs.com/package/proper-lockfile) if you need support for it.
-

This package does try to acquire the lock more than once.
