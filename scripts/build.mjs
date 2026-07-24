import { copyFile, mkdir, rm } from 'node:fs/promises';

const projectRoot = new URL('../', import.meta.url);
const outputDirectory = new URL('dist/', projectRoot);
const staticFiles = [
  'index.html',
  'blog.html',
  'styles.css',
  'github_profile.JPG',
  'og.png',
];

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  staticFiles.map((file) =>
    copyFile(new URL(file, projectRoot), new URL(file, outputDirectory)),
  ),
);

console.log(`Built ${staticFiles.length} static files in dist/.`);
