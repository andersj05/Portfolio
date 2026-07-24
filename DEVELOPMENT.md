# Portfolio development plan

This document is the source of truth for building and releasing
[andersj.dev](https://andersj.dev). The site remains intentionally simple:
content quality, accessibility, speed, and maintainability take priority over
framework complexity.

## 1. Repository foundation

The first change establishes the workflow before visual development:

- protect `main` as the production branch and `dev` as the integration branch;
- branch from `dev` using `feat/*`, `fix/*`, or `chore/*` and merge through pull
  requests;
- standardize UTF-8, LF line endings, indentation, and formatting;
- validate HTML and CSS;
- test links, required assets, accessibility, and responsive overflow;
- run identical checks locally and in GitHub Actions;
- keep dependencies current through grouped monthly updates.

This phase must not redesign the page.

## 2. Content intake

Convert the resume into a private working outline before publishing anything.
Confirm the public name, short introduction, contact links, roles, education,
selected projects, and any details that should remain private. Rewrite resume
language for the web rather than copying every bullet.

Deliverable: an approved content inventory and section order.

## 3. Information architecture and visual direction

Build the site around a direct introduction followed by scannable work, project,
and background sections. Create an original design for Anders, using the
supplied profile photo, a restrained type system, and a small color palette.

Define mobile-first layout behavior, navigation, reusable spacing and type
tokens, link states, focus states, and image treatment before polishing.

Deliverable: one agreed direction implemented in the browser, not multiple
half-built themes.

## 4. Implementation

Keep the static architecture unless the approved content requires routing or
dynamic behavior. Use semantic HTML, progressive enhancement, responsive images,
stable dimensions to avoid layout shift, and minimal JavaScript.

Implement in small, reviewable slices:

1. page structure and real content;
2. typography, spacing, and color;
3. profile photo and project media;
4. responsive and interaction states;
5. metadata, social preview, icons, and structured data.

## 5. Verification

Every pull request must pass `npm run check` and `npm run test:e2e`. For visual
changes, also verify:

- current desktop and mobile Chromium;
- keyboard-only navigation and visible focus;
- reduced-motion behavior where animation exists;
- headings, landmarks, alternative text, and contrast;
- no horizontal overflow or broken local resources;
- optimized images and acceptable load performance;
- links, email addresses, page title, description, and social metadata.

Before the first public release, add a Lighthouse run and target at least 95 for
accessibility, best practices, and SEO, with performance regressions explained
in the pull request.

## 6. Release and domain

Cloudflare Pages remains the hosting target. Feature, fix, and maintenance pull
requests merge into `dev` after required checks pass. Preview deployments belong
to pull requests; production deploys only from `main`.

For the first release:

1. merge approved feature pull requests into `dev`;
2. verify the integrated site on `dev`;
3. open and approve a release pull request from `dev` to `main`;
4. verify the production deployment;
5. connect both `andersj.dev` and `www.andersj.dev`;
6. redirect one hostname to the canonical hostname;
7. verify HTTPS, canonical metadata, and the not-found response;
8. run a production smoke test and record the release.

Rollback is a revert of the merge commit or a Cloudflare rollback to the last
known-good deployment.

## 7. Repository settings

Configure branch rulesets for both `main` and `dev` in GitHub:

- require a pull request before merging;
- require the `Format, lint, and test` status check;
- require conversation resolution;
- require linear history;
- block force pushes and deletion;
- allow squash merges and delete merged branches automatically.

Additionally, allow only pull requests from `dev` to target `main` as a team
convention. Feature, fix, and maintenance branches target `dev`.

For a solo-maintained portfolio, an approving review may remain optional so that
the owner is not locked out. Add a required approval if another maintainer
joins.

## Definition of done

A change is done only when its content is approved, scope is focused, automated
checks pass, relevant visual and accessibility checks are complete, the pull
request explains the change, and the deployed result is verified when a release
is involved.
