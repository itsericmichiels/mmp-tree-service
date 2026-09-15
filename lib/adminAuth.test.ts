import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createSessionToken, verifySessionToken } from "./adminAuth";

describe("adminAuth", () => {
  const originalPassword = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-password";
  });

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("returns null when no password is configured", async () => {
    delete process.env.ADMIN_PASSWORD;
    expect(await createSessionToken()).toBeNull();
  });

  it("issues a token that verifies successfully", async () => {
    const token = await createSessionToken();
    expect(token).not.toBeNull();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("rejects a missing or malformed token", async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("not-a-real-token")).toBe(false);
  });

  it("rejects a token signed with a different password", async () => {
    const token = await createSessionToken();
    process.env.ADMIN_PASSWORD = "a-different-password";
    expect(await verifySessionToken(token)).toBe(false);
  });

  it("rejects a token if the password later becomes unconfigured", async () => {
    const token = await createSessionToken();
    delete process.env.ADMIN_PASSWORD;
    expect(await verifySessionToken(token)).toBe(false);
  });
});
