# html-app

This repository hosts a set of standalone single-page HTML apps. Every top-level app folder is deployed as its own Cloudflare Worker, and the Worker name always matches the folder name.

## URL convention

Each deployed app is expected to be available at:

`https://<folder>.nightttt7.workers.dev`

Examples:

- `container-auction` -> `https://container-auction.nightttt7.workers.dev`
- `gameoflife` -> `https://gameoflife.nightttt7.workers.dev`
- `picture-word-match` -> `https://picture-word-match.nightttt7.workers.dev`
- `staff` -> `https://staff.nightttt7.workers.dev`

## How automatic deployment works

- A push to `main` runs `.github/workflows/deploy-html-apps.yml`.
- The workflow scans the repository for deployable app folders.
- If a new top-level folder contains `index.html`, it is picked up automatically on the next push.
- If a folder contains exactly one `.html` file but not `index.html`, deployment aliases that file to `index.html` automatically.
- Only changed app folders are redeployed on normal pushes.
- If shared deployment files under `.cloudflare/` or the workflow itself change, the workflow redeploys every app.
- `workflow_dispatch` can deploy one app or all apps on demand.

## App folder rules

- One top-level folder maps to one Worker.
- Folder names must be valid Worker names: lowercase letters, numbers, and hyphens only.
- Each app folder must contain either `index.html` or exactly one `.html` file.
- Static assets such as CSS, JavaScript, images, and fonts can live next to the HTML entry file inside the same folder.
- Removing a folder does not automatically delete the previously deployed Worker. Cleanup is manual by design.

## Deployment implementation

- Shared defaults live in `.cloudflare/deploy.defaults.json`.
- App discovery lives in `.cloudflare/scripts/apps.mjs`.
- Target selection for GitHub Actions lives in `.cloudflare/scripts/resolve-targets.mjs`.
- Per-app deployment lives in `.cloudflare/scripts/deploy-app.mjs`.

The workflow uses the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, which are already configured for this repository.

## Manual redeploy from GitHub

Use the `Deploy HTML Apps to Cloudflare Workers` workflow in GitHub Actions.

- Leave `app` empty to redeploy every app.
- Set `app` to a folder name such as `gameoflife` to redeploy just that app.

## Local maintenance

For a safe local dry run, no Cloudflare credentials are required:

```bash
node .cloudflare/scripts/resolve-targets.mjs --mode manual
node .cloudflare/scripts/deploy-app.mjs staff --dry-run
```

For a real local deployment, export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` first, then run:

```bash
node .cloudflare/scripts/deploy-app.mjs staff
```
