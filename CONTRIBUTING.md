# Contributing

## Branch workflow

`main` is the production branch and should always be deployable. `dev` is the
integration branch for the next release. Make each change on a short-lived
branch created from an up-to-date `dev`:

- `feat/<short-description>` for site features or content sections
- `fix/<short-description>` for defects
- `chore/<short-description>` for tooling and maintenance

Open a pull request into `dev`, let all required checks pass, review the
rendered change, then squash-merge. Promote a tested release from `dev` to
`main` through a separate pull request.

Do not commit directly to `main` or `dev`, force-push either protected branch,
or mix unrelated changes in one pull request.

## Local workflow

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Before opening a pull request:

```sh
npm run check
npm run test:e2e
```

Run `npm run format` to apply the repository's formatting rules.

## Commit and review conventions

Use focused, imperative commit subjects, preferably Conventional Commit style,
such as `feat: add experience section` or `chore: add quality checks`.

A pull request is ready to merge when:

- its scope is clear and contains no unrelated files;
- automated checks pass;
- visual changes have desktop and mobile evidence;
- keyboard navigation and accessible names are verified when relevant;
- content, links, metadata, and image rights have been reviewed;
- no secrets, private resume details, or generated artifacts are committed.
