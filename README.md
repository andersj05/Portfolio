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
- deploy command: `npm run deploy:production`
- non-production deploy command: `npm run deploy:preview`

The build creates `dist/`, and `wrangler.jsonc` deploys that directory as static
assets. Both deployment scripts explicitly select `wrangler.jsonc` and `dist/`
so generated Cloudflare settings cannot redirect uploads to the repository root.
