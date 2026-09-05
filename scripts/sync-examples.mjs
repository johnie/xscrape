import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.dirname(import.meta.dirname);
const check = process.argv.includes("--check");
const exampleBlock =
  /<!-- example: (?<name>[a-z-]+) -->\n[\s\S]*?<!-- \/example -->/gu;

const markdownFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return markdownFiles(filePath);
    }
    return entry.name.endsWith(".md") ? [filePath] : [];
  });

let stale = 0;
for (const markdownPath of [
  path.join(root, "README.md"),
  ...markdownFiles(path.join(root, "docs")),
]) {
  const original = readFileSync(markdownPath, "utf-8");
  const updated = original.replace(exampleBlock, (_block, name) => {
    const source = readFileSync(
      path.join(root, "examples", `${name}.ts`),
      "utf-8"
    ).trimEnd();
    return `<!-- example: ${name} -->\n\n\`\`\`typescript\n${source}\n\`\`\`\n\n<!-- /example -->`;
  });
  if (updated === original) {
    continue;
  }
  if (check) {
    console.error(`Example snippets are stale: ${markdownPath}`);
    stale += 1;
  } else {
    writeFileSync(markdownPath, updated);
  }
}
if (stale > 0) {
  console.error("Run pnpm docs:sync after editing examples.");
  process.exitCode = 1;
}
