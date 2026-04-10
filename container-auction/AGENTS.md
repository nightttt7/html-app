# AGENTS.md

## container-auction

- This folder is a standalone static HTML app deployed as the `container-auction` Worker.
- Keep the app self-contained with vanilla HTML, CSS, and JavaScript unless a split is clearly necessary.
- Preserve the day-based auction loop: auction -> sales -> reward -> next day, with the floating day-action button handling the sales/end-of-day transition.
- Keep the Chinese/English language toggle working for the main UI copy whenever changing labels, buttons, or phase messaging.
- Preserve the compact sticky mobile status header; keep its labels short so it does not cover the play area.
- Validate changes from the repository root with the committed shared script `node .cloudflare/scripts/deploy-app.mjs container-auction --dry-run`.
- Manually verify UI changes in a browser because gameplay balance depends on visible state and player flow.
