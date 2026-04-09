# html-app Copilot Instructions

- Treat each top-level folder as an independent static HTML app.
- A deployable app must contain `index.html`, or exactly one `.html` file that can be aliased to `index.html` during deployment.
- Keep deployable folder names compatible with Cloudflare Worker names: lowercase letters, numbers, and hyphens only.
- The Worker name must stay identical to the folder name, and the expected URL format is `https://<folder>.nightttt7.workers.dev`.
- Shared deployment automation lives in `.cloudflare/scripts/` and `.github/workflows/deploy-html-apps.yml`; extend those files instead of reintroducing one workflow per app.
- When changing deployment behavior, update both the automation and `README.md` in the same change.
- Do not commit Cloudflare credentials, account IDs, or per-app generated Wrangler config files.