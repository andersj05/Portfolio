import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const blogHtml = await readFile(new URL('blog.html', root), 'utf8');
const pages = [
  ['index.html', html],
  ['blog.html', blogHtml],
];

test('required source, page, and media files exist', async () => {
  await Promise.all(
    [
      'index.html',
      'blog.html',
      'styles.css',
      'github_profile.JPG',
      'og.png',
    ].map((file) => access(new URL(file, root))),
  );
});

test('profile photo stays within a sensible static-site size budget', async () => {
  const photo = await stat(new URL('github_profile.JPG', root));
  assert.ok(photo.size <= 1_000_000, 'Profile photo must be 1 MB or smaller');
});

test('every same-page link resolves to an element id', () => {
  for (const [file, source] of pages) {
    const ids = new Set(
      [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
    );
    const fragments = [...source.matchAll(/\shref="#([^"]+)"/g)].map(
      (match) => match[1],
    );

    assert.ok(fragments.length > 0, `Expected same-page links in ${file}`);
    for (const fragment of fragments) {
      assert.ok(
        ids.has(fragment),
        `Missing target for #${fragment} in ${file}`,
      );
    }
  }
});

test('local stylesheet and media references resolve', async () => {
  const paths = pages.flatMap(([, source]) =>
    [...source.matchAll(/\s(?:href|src)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter(
        (path) =>
          !path.startsWith('#') &&
          !path.startsWith('http://') &&
          !path.startsWith('https://') &&
          !path.startsWith('mailto:') &&
          !path.includes('#'),
      ),
  );

  await Promise.all(paths.map((path) => access(new URL(path, root))));
});

test('new-tab links prevent opener access', () => {
  const links = pages.flatMap(([, source]) => [
    ...source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g),
  ]);

  for (const link of links) {
    assert.match(link[0], /\srel="[^"]*\bnoopener\b[^"]*"/);
  }
});
