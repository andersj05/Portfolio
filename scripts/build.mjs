import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { marked } from 'marked';

const projectRoot = new URL('../', import.meta.url);
const outputDirectory = new URL('dist/', projectRoot);
const blogSourceDirectory = new URL('blogs/', projectRoot);
const blogOutputDirectory = new URL('blog/', outputDirectory);
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
  'project-images/toll-road-report.png',
  'reports/the-toll-road-moves.pdf',
];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseFrontMatter(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    throw new Error(
      `${filename} must begin with front matter enclosed by --- lines.`,
    );
  }

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    metadata[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
  }

  for (const field of ['title', 'date', 'description']) {
    if (!metadata[field]) {
      throw new Error(`${filename} is missing required "${field}" metadata.`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) {
    throw new Error(`${filename} date must use YYYY-MM-DD format.`);
  }

  const date = new Date(`${metadata.date}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) {
    throw new Error(`${filename} contains an invalid date.`);
  }

  if (/^#\s+/m.test(match[2])) {
    throw new Error(
      `${filename} must not contain a level-one heading; the front-matter title is rendered as the page heading.`,
    );
  }

  return {
    ...metadata,
    body: match[2],
    date,
  };
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });
await mkdir(blogOutputDirectory, { recursive: true });
await mkdir(reportOutputDirectory, { recursive: true });
await mkdir(projectImageOutputDirectory, { recursive: true });

await Promise.all(
  staticFiles.map((file) =>
    copyFile(new URL(file, projectRoot), new URL(file, outputDirectory)),
  ),
);

const blogFiles = (await readdir(blogSourceDirectory))
  .filter((file) => file.endsWith('.md'))
  .sort();

const posts = await Promise.all(
  blogFiles.map(async (filename) => {
    const slug = filename.slice(0, -3);
    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug)) {
      throw new Error(
        `${filename} must use a lowercase filename with words separated by hyphens or underscores.`,
      );
    }

    const source = await readFile(
      new URL(filename, blogSourceDirectory),
      'utf8',
    );
    return {
      ...parseFrontMatter(source, filename),
      filename,
      slug,
    };
  }),
);

posts.sort(
  (left, right) =>
    right.date.valueOf() - left.date.valueOf() ||
    left.title.localeCompare(right.title),
);

const blogTemplate = await readFile(new URL('blog.html', projectRoot), 'utf8');
const postTemplate = await readFile(
  new URL('templates/blog-post.html', projectRoot),
  'utf8',
);

const blogList =
  posts.length === 0
    ? '<p class="empty-posts">No posts published yet.</p>'
    : posts
        .map(
          (post) => `
            <a class="post-row" href="blog/${escapeHtml(post.slug)}.html">
              <time datetime="${escapeHtml(post.date.toISOString().slice(0, 10))}">
                ${escapeHtml(formatDate(post.date))}
              </time>
              <div>
                <h2>${escapeHtml(post.title)}</h2>
                <p>${escapeHtml(post.description)}</p>
              </div>
              <span aria-hidden="true">&nearr;</span>
            </a>`,
        )
        .join('\n');

if (!blogTemplate.includes('<!-- BLOG_LIST -->')) {
  throw new Error('blog.html is missing the BLOG_LIST build marker.');
}

await writeFile(
  new URL('blog.html', outputDirectory),
  blogTemplate.replace('<!-- BLOG_LIST -->', blogList),
);

await Promise.all(
  posts.map(async (post) => {
    const renderedPost = postTemplate
      .replaceAll('{{TITLE}}', escapeHtml(post.title))
      .replaceAll('{{DESCRIPTION}}', escapeHtml(post.description))
      .replaceAll('{{DATE}}', post.date.toISOString().slice(0, 10))
      .replaceAll('{{FORMATTED_DATE}}', escapeHtml(formatDate(post.date)))
      .replaceAll('{{SLUG}}', escapeHtml(post.slug))
      .replaceAll('{{CONTENT}}', marked.parse(post.body));

    await writeFile(
      new URL(`${post.slug}.html`, blogOutputDirectory),
      renderedPost,
    );
  }),
);

console.log(
  `Built ${staticFiles.length + 1} site files and ${posts.length} blog post(s) in dist/.`,
);
