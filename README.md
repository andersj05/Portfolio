# Anders Jensen — Portfolio

The source for [andersj.dev](https://andersj.dev), a static portfolio hosted on
Cloudflare Pages.

## Development

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Before opening a pull request, run:

```sh
npm run check
npm run test:e2e
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for the delivery plan and
[CONTRIBUTING.md](CONTRIBUTING.md) for the branch and review workflow.

## Writing blog posts

Add a lowercase, hyphen-separated Markdown file to `blogs/`. Start from
`blogs/example.md` and keep the front matter at the top:

```md
---
title: 'Post title'
date: '2026-07-24'
description: 'A short summary.'
---
```

Write the post below the front matter using standard Markdown. The `title`
becomes the page's main heading, so begin the body with a paragraph or `##`
section rather than another `#` heading. The build creates an individual page
for every file and orders the blog index by `date`, newest first.

## Deployment

Cloudflare Workers deploys the production `main` branch as static assets. Pull
requests should receive preview deployments. Feature branches merge into `dev`;
reviewed release pull requests promote `dev` to `main`.

Cloudflare Workers Builds uses:

- build command: `npm run build`
- deploy command: `npm run deploy:production`
- non-production deploy command: `npm run deploy:preview`

The build creates `dist/`, and `wrangler.jsonc` deploys that directory as static
assets. Both deployment scripts explicitly select `wrangler.jsonc` and `dist/`
so generated Cloudflare settings cannot redirect uploads to the repository root.
