# AGENTS.md

## container-auction

- This folder is a standalone static HTML app deployed as the `container-auction` Worker.
- Keep the app self-contained with vanilla HTML, CSS, and JavaScript unless a split is clearly necessary.
- Preserve the day-based auction loop: auction -> sales -> reward -> next day.
- Validate changes with `node .cloudflare/scripts/deploy-app.mjs container-auction --dry-run` from the repository root.
- Manually verify UI changes in a browser because gameplay balance depends on visible state and player flow.
