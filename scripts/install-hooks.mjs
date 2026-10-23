// Installs the git pre-commit hook that sets the release number (scripts/bump-version.mjs) in
// every commit. Run once per clone: npm run install-hooks
import { writeFileSync, chmodSync } from "node:fs";
import { execSync } from "node:child_process";

const hooks = execSync("git rev-parse --git-path hooks", { encoding: "utf8" }).trim();
const hook = `${hooks}/pre-commit`;
writeFileSync(hook, "#!/bin/sh\nnode scripts/bump-version.mjs && git add src/lib/version.ts\n");
try {
  chmodSync(hook, 0o755);
} catch {
  // Windows: git runs it anyway.
}
console.log(`installed ${hook}`);
