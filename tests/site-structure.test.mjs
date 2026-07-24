import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');

test('required source and profile-photo files exist', async () => {
  await Promise.all(
    ['index.html', 'styles.css', 'github_profile.JPG'].map((file) =>
      access(new URL(file, root)),
    ),
  );
});

test('profile photo stays within a sensible static-site size budget', async () => {
  const photo = await stat(new URL('github_profile.JPG', root));
  assert.ok(photo.size <= 1_000_000, 'Profile photo must be 1 MB or smaller');
});

test('every same-page link resolves to an element id', () => {
  const ids = new Set(
    [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
  );
  const fragments = [...html.matchAll(/\shref="#([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.ok(fragments.length > 0, 'Expected at least one same-page link');
  for (const fragment of fragments) {
    assert.ok(ids.has(fragment), `Missing target for #${fragment}`);
  }
});

test('local stylesheet and media references resolve', async () => {
  const paths = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter(
      (path) =>
        !path.startsWith('#') &&
        !path.startsWith('http://') &&
        !path.startsWith('https://') &&
        !path.startsWith('mailto:'),
    );

  await Promise.all(paths.map((path) => access(new URL(path, root))));
});

test('new-tab links prevent opener access', () => {
  const links = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)];

  for (const link of links) {
    assert.match(link[0], /\srel="[^"]*\bnoopener\b[^"]*"/);
  }
});
