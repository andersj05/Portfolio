import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const sourceHtml = await readFile(new URL('index.html', root), 'utf8');
const builtPages = await Promise.all(
  ['index.html', 'blog.html', 'blog/example.html'].map(async (path) => [
    path,
    await readFile(new URL(path, output), 'utf8'),
  ]),
);

test('required source, template, blog, and media files exist', async () => {
  await Promise.all(
    [
      'index.html',
      'blog.html',
      'styles.css',
      'github_profile.JPG',
      'og.png',
      'blogs/example.md',
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
  const links = [...sourceHtml.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)];

  for (const link of links) {
    assert.match(link[0], /\srel="[^"]*\bnoopener\b[^"]*"/);
  }
});

test('Markdown posts render and blog dates are newest first', () => {
  const blogPage = builtPages.find(([file]) => file === 'blog.html')[1];
  const postPage = builtPages.find(([file]) => file === 'blog/example.html')[1];
  const dates = [...blogPage.matchAll(/<time datetime="([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.match(blogPage, /href="blog\/example\.html"/);
  assert.match(postPage, /<h1>Your first post<\/h1>/);
  assert.match(postPage, /<h2>Add a section<\/h2>/);
  assert.deepEqual(dates, [...dates].sort().reverse());
});
