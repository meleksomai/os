// Portable env-driven flag. Async to avoid touching the `await` call sites in
// app code. The default applies unless an explicit "false"/"0" is set via the
// FLAG_<UPPER_SNAKE_KEY> environment variable (e.g. FLAG_IS_BABY_BORN,
// FLAG_ENABLE_SHARE_WISHES). Framework-agnostic: no Vercel/Next imports.
const FALSY_VALUES = new Set(["false", "0"]);

export const createFlag = (key: string, defaultValue = false) => {
  const envKey = `FLAG_${key.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`;
  return (): Promise<boolean> => {
    const raw = process.env[envKey];
    if (raw == null) {
      return Promise.resolve(defaultValue);
    }
    return Promise.resolve(!FALSY_VALUES.has(raw));
  };
};
