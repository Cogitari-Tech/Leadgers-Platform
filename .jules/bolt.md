## 2024-05-24 - [Avoid lockfile churn from npm install]

**Learning:** `npm install` in some restricted environments may silently prune/remove platform-specific or optional binaries (like `esbuild`), leading to massive lockfile churn.
**Action:** When performing local dependency checks or installing packages like eslint globally or temporarily to verify code, be extremely careful not to commit massive, unrelated `package-lock.json` changes. Always review lockfile diffs before submitting.
