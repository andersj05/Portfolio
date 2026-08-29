import { copyFile, mkdir, rm } from 'node:fs/promises';

const projectRoot = new URL('../', import.meta.url);
const outputDirectory = new URL('dist/', projectRoot);
const reportOutputDirectory = new URL('reports/', outputDirectory);
const projectImageOutputDirectory = new URL('project-images/', outputDirectory);
const staticFiles = [
  'index.html',
  'projects.html',
  'substack.html',
  'styles.css',
  'github_profile.JPG',
  'og.png',
  'project-images/alpha-orchestration.png',
  'project-images/kernelcubed.png',
  'project-images/analystprep.png',
  'project-images/autoharness.png',
  'project-images/toll-road-report.png',
  'reports/the-toll-road-moves.pdf',
];

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });
await mkdir(reportOutputDirectory, { recursive: true });
await mkdir(projectImageOutputDirectory, { recursive: true });

await Promise.all(
  staticFiles.map((file) =>
    copyFile(new URL(file, projectRoot), new URL(file, outputDirectory)),
  ),
);

console.log(`Built ${staticFiles.length} site files in dist/.`);
