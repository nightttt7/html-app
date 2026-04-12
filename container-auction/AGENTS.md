# Container Auction Guidelines

- This folder is a standalone static HTML app deployed as the `container-auction` Worker.
- Keep the app self-contained with vanilla HTML, CSS, and JavaScript unless a split is clearly necessary.
- Preserve the day-based auction loop: auction -> sales -> reward -> next day, with the floating day-action button handling the sales/end-of-day transition.
- Keep the Chinese/English language toggle working for the main UI copy whenever changing labels, buttons, or phase messaging.
- Preserve the fixed two-row status header on every viewport, not just mobile layouts.
- Keep the header rows stable: top row is net worth, warehouse cost, active rewards; bottom row is cash, sell value, day, license fee.
- Keep the status header fixed to the viewport itself; do not reintroduce container-bound sticky behavior.
- On narrow screens, including iPhone SE width, the fixed status header must stay fully inside the viewport with no right-edge clipping or horizontal page overflow.
- Do not give the mobile status header or its internal grid a hard min-width that can exceed the available viewport width; tighten spacing before allowing overflow.
- Keep the active-reward details bubble able to overflow beyond the header so longer reward lists are fully readable.
- Preserve whole-card interactions for auction lots, warehouse items, and reward choices; do not regress to tiny per-card action buttons.
- Keep the shared interaction hint beside the rules summary instead of duplicating action hints inside each card.
- The reward phase should use the same panel rhythm as the auction and warehouse scenes, with a single phase title and tight spacing above the reward cards.
- Keep small labels and badges readable against the warm light card backgrounds; avoid pale foreground colors on similarly pale fills.
- Keep auction, reward, and warehouse cards free of decorative top gradient strips unless a future task explicitly asks for them.
- Use `$` as the currency symbol in both language modes unless gameplay requirements change.
- Validate changes from the repository root with the committed shared script `node .cloudflare/scripts/deploy-app.mjs container-auction --dry-run`.
- Manually verify UI changes in a browser, including a narrow mobile viewport pass, because gameplay balance depends on visible state and player flow.