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

## Deployment

Cloudflare Workers deploys the production `main` branch as static assets. Pull
requests should receive preview deployments. Feature branches merge into `dev`;
reviewed release pull requests promote `dev` to `main`.

Cloudflare Workers Builds uses:

- build command: `npm run build`
- deploy command: `npx wrangler deploy`
- non-production deploy command: `npx wrangler versions upload`

The build creates `dist/`, and `wrangler.jsonc` deploys that directory as static
assets.
