import { tmpdir } from "os";
import { chdir, cwd } from "process";
import path from "path";
import assert from "assert";

import {
  CouldNotAcquireLockfileError,
  CouldNotReleaseLockfileError,
  LockfileAlreadyExistedError,
  withLockfile,
} from ".";
import { createFileSync } from "./create-file";
import { mkdirSync, unlinkSync, existsSync } from "fs";

describe("withLockfile", function () {
  const owd = cwd();

  before("Use a tmpdir", function () {
    const tmp = path.join(tmpdir(), Date.now().toString());
    mkdirSync(tmp);
    chdir(tmp);
  });

  after("Restor wd", function () {
    chdir(owd);
  });

  it("Succesfully acquires a lockfile", function () {
    let i: number = 1;

    withLockfile("doesnt-exist.lockfile", () => {
      i = 123;
    });

    assert.strictEqual(i, 123);
  });

  it("Successfully deletes the lockfile if the criticalOperation runs correctly", function () {
    const lockfilePath = "doesnt-exist-2.lockfile";
    withLockfile(lockfilePath, () => 123);

    assert.strictEqual(existsSync(lockfilePath), false, "Lockfile exists");
  });

  it("Successfully deletes the lockfile if the criticalOperation throws", function () {
    const lockfilePath = "doesnt-exist-3.lockfile";

    assert.throws(
      () =>
        withLockfile(lockfilePath, () => {
          throw new Error("Critical section failed");
        }),
      /Critical section failed/
    );

    assert.strictEqual(existsSync(lockfilePath), false, "Lockfile exists");
  });

  it("Throws the right error when the lockfile already existed", function () {
    const lockfilePath = "exists.lockfile";
    createFileSync(lockfilePath);

    assert.throws(
      () => withLockfile(lockfilePath, () => 123),
      LockfileAlreadyExistedError
    );
  });

  it("Throws the right error when failing to acquire lockfile", function () {
    const lockfilePath = "non-existing-dir/doesnt-exist.lockfile";

    assert.throws(
      () => withLockfile(lockfilePath, () => 123),
      CouldNotAcquireLockfileError
    );
  });

  it("Throws the right error when failing to release the lockfile", function () {
    const lockfilePath = "fails-to-be-released.lockfile";
    assert.throws(
      () => withLockfile(lockfilePath, () => unlinkSync(lockfilePath)),
      CouldNotReleaseLockfileError
    );
  });

  it("Throws withLockfile's own errors when failing to release the lockfile even if the criticalSection throws", function () {
    const lockfilePath =
      "critical-section-throws-and-lockfile-fails-to-be-released.lockfile";

    assert.throws(
      () =>
        withLockfile(lockfilePath, () => {
          unlinkSync(lockfilePath);
          throw new Error("Critical section failed");
        }),
      CouldNotReleaseLockfileError
    );
  });
});
