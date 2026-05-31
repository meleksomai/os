import { afterEach, describe, expect, it, vi } from "vitest";
import { createFlag } from "./lib/create-flag";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createFlag", () => {
  it("returns the default value when no env override is set", async () => {
    const flag = createFlag("enableShareWishes", true);

    expect(await flag()).toBe(true);
  });

  it("defaults to false when no default is provided", async () => {
    const flag = createFlag("someFeature");

    expect(await flag()).toBe(false);
  });

  it("reads the FLAG_<UPPER_SNAKE_KEY> env var derived from a camelCase key", async () => {
    vi.stubEnv("FLAG_ENABLE_SHARE_WISHES", "false");
    const flag = createFlag("enableShareWishes", true);

    expect(await flag()).toBe(false);
  });

  it("treats 0 as a falsy override", async () => {
    vi.stubEnv("FLAG_IS_BABY_BORN", "0");
    const flag = createFlag("isBabyBorn", true);

    expect(await flag()).toBe(false);
  });

  it("treats any non-falsy value as true", async () => {
    vi.stubEnv("FLAG_IS_BABY_BORN", "true");
    const flag = createFlag("isBabyBorn", false);

    expect(await flag()).toBe(true);
  });

  it("treats an empty string env value as true", async () => {
    vi.stubEnv("FLAG_IS_BABY_BORN", "");
    const flag = createFlag("isBabyBorn", false);

    expect(await flag()).toBe(true);
  });
});

describe("flag exports", () => {
  it("isBabyBorn defaults to true", async () => {
    const { isBabyBorn } = await import("./index");

    expect(await isBabyBorn()).toBe(true);
  });

  it("enableShareWishes defaults to true", async () => {
    const { enableShareWishes } = await import("./index");

    expect(await enableShareWishes()).toBe(true);
  });
});
