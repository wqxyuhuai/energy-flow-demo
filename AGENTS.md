# Energy Flow Demo Project Instructions

## Source of truth

- Before changing the visualization, read `docs/flow-motion-rules.md` in full.
- The latest explicit user decision overrides older rules. Update the rule document in the same task so future work does not repeat the conflict.
- Keep `index.html` self-contained unless the user explicitly asks for a different architecture.

## Product invariants

- Use English copy, the light WattDesk visual direction, SF Pro Display at weights `400/500`, and the current restrained gray/white component styling.
- Do not wrap the app in a large outer white card.
- Keep battery on the left and inverter on the right; the default flow is battery-to-inverter.
- Keep the direction toggle before the Shape selector; its arrow switches between battery-to-inverter and inverter-to-battery travel and must be persisted.
- Keep the three routes orthogonal: `Straight`, `L-Shape`, and `S-Shape`.
- The moving line is a fixed-length segment whose visibility changes only through clipping at cards and container edges. It must not grow, shrink, stretch, or turn into many simultaneous lines.
- Endpoint fading and color transitions follow path arc length. Do not use fixed horizontal gradients.
- Use one symmetric `Fade` control for both track endpoints.
- Preserve the `0–5%` power floor: nonzero power remains visible at `1.5px` and `10px/s`; exactly `0 kW` is inactive.
- Keep the Shape and AC/DC controls at matching height, typography, and spacing. Do not reintroduce native blue option highlighting.
- The battery power value and inverter model both use `18px`.

## Interaction and quality

- Preserve pause/resume, reset, state persistence, keyboard focus, reduced-motion handling, and responsive resizing.
- Keep slider and preset interactions neutral, smooth, and hover-visible.
- Verify changes at all three path shapes, both AC and DC colors, low/medium/maximum power, and narrow viewports.
- Fix implementation bugs instead of silently changing established defaults or visual rules.

## Delivery

- Never push, deploy, or publish unless the user explicitly requests it in the current task.
- The canonical production files are the repository `index.html` and `docs/flow-motion-rules.md`.
- When a durable requirement changes, update `docs/flow-motion-rules.md`; do not leave the decision only in chat.
