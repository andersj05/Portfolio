import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const sourceHtml = await readFile(new URL('index.html', root), 'utf8');
const builtPages = await Promise.all(
  [
    'index.html',
    'projects.html',
    'substack.html',
    'blog.html',
    'blog/anthropic_opus_5_eval.html',
  ].map(async (path) => [path, await readFile(new URL(path, output), 'utf8')]),
);

test('required source, template, blog, and media files exist', async () => {
  await Promise.all(
    [
      'index.html',
      'projects.html',
      'substack.html',
      'blog.html',
      'styles.css',
      'github_profile.JPG',
      'og.png',
      'project-images/alpha-orchestration.png',
      'project-images/kernelcubed.png',
      'project-images/analystprep.png',
      'project-images/toll-road-report.png',
      'reports/the-toll-road-moves.pdf',
      'blogs/anthropic_opus_5_eval.md',
      'templates/blog-post.html',
    ].map((file) => access(new URL(file, root))),
  );
});

test('profile photo stays within a sensible static-site size budget', async () => {
  const photo = await stat(new URL('github_profile.JPG', root));
  assert.ok(photo.size <= 1_000_000, 'Profile photo must be 1 MB or smaller');
});

test('every same-page link resolves to an element id', () => {
  for (const [file, source] of builtPages) {
    const ids = new Set(
      [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
    );
    const fragments = [...source.matchAll(/\shref="#([^"]+)"/g)].map(
      (match) => match[1],
    );

    for (const fragment of fragments) {
      assert.ok(
        ids.has(fragment),
        `Missing target for #${fragment} in ${file}`,
      );
    }
  }
});

test('built local stylesheet, page, and media references resolve', async () => {
  for (const [file, source] of builtPages) {
    const pageUrl = new URL(file, output);
    const paths = [...source.matchAll(/\s(?:href|src)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter(
        (path) =>
          !path.startsWith('#') &&
          !path.startsWith('http://') &&
          !path.startsWith('https://') &&
          !path.startsWith('mailto:') &&
          !path.includes('#'),
      );

    await Promise.all(paths.map((path) => access(new URL(path, pageUrl))));
  }
});

test('new-tab links prevent opener access', () => {
  const links = builtPages.flatMap(([, source]) => [
    ...source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g),
  ]);

  for (const link of links) {
    assert.match(link[0], /\srel="[^"]*\bnoopener\b[^"]*"/);
  }
});

test('main navigation exposes projects without a blog tab', () => {
  assert.match(sourceHtml, /href="projects\.html"[^>]*>[\s\S]*?Projects/);

  for (const [file, source] of builtPages) {
    assert.doesNotMatch(
      source,
      /<a href="(?:\.\.\/)?blog\.html"[^>]*>[\s\S]*?Blog/,
      `Unexpected Blog navigation tab in ${file}`,
    );
  }

  const projectsPage = builtPages.find(([file]) => file === 'projects.html')[1];
  assert.match(projectsPage, /<h1>Selected projects<\/h1>/);
  assert.doesNotMatch(
    projectsPage,
    /A few things I have built|04 projects \/ one page|What I did/,
  );
  assert.doesNotMatch(sourceHtml, /portfolio: ready/);
  assert.equal(
    [...projectsPage.matchAll(/<article class="project-detail(?: [^"]*)?">/g)]
      .length,
    4,
  );
  assert.match(projectsPage, /<h2>CortexHarness<\/h2>/);
  assert.match(
    projectsPage,
    /href="https:\/\/github\.com\/andersj05\/CortexHarness"/,
  );
});

test('profile links to a private Substack request page', () => {
  const substackPage = builtPages.find(([file]) => file === 'substack.html')[1];

  assert.match(sourceHtml, /href="substack\.html"[^>]*>[\s\S]*?Substack/);
  assert.match(
    substackPage,
    /<h1[^>]*>Substack available upon request\.<\/h1>/,
  );
  assert.doesNotMatch(substackPage, /href="https:\/\/[^\"]*substack\.com/);
  assert.doesNotMatch(substackPage, /apjensen|keep my Substack separate/);
});

test('Markdown posts render and blog dates are newest first', () => {
  const blogPage = builtPages.find(([file]) => file === 'blog.html')[1];
  const postPage = builtPages.find(
    ([file]) => file === 'blog/anthropic_opus_5_eval.html',
  )[1];
  const dates = [...blogPage.matchAll(/<time datetime="([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.match(blogPage, /href="blog\/anthropic_opus_5_eval\.html"/);
  assert.match(postPage, /<h1>Anthropic Is RL Maxxing Opus 5<\/h1>/);
  assert.match(postPage, /After looking into Opus 5/);
  assert.deepEqual(dates, [...dates].sort().reverse());
});
