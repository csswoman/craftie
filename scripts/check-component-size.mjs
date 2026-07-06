import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');
const MAX_LINES = 250;

async function collectTsxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectTsxFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function countLines(content) {
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r\n|\r|\n/).length;
}

const files = await collectTsxFiles(COMPONENTS_DIR);
const oversized = [];

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const lines = countLines(content);

  if (lines > MAX_LINES) {
    oversized.push({
      lines,
      file: path.relative(ROOT, file).replaceAll(path.sep, '/'),
    });
  }
}

if (oversized.length > 0) {
  console.error(`Components must stay under ${MAX_LINES} lines:`);

  for (const item of oversized.sort((left, right) => right.lines - left.lines)) {
    console.error(`- ${item.file}: ${item.lines} lines`);
  }

  process.exit(1);
}

console.log(`Component size check passed (${files.length} files, max ${MAX_LINES} lines).`);
