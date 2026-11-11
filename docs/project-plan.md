# Energy Flow Demo Project Plan

Status: active demo, deployed at `https://flow.carlwang.cn`.

## Current scope

- Single self-contained `index.html` deployed through Cloudflare Pages.
- Fixed `iHybrid 50K` demo model at a `50kW` rated maximum.
- Three orthogonal path shapes: `Straight`, `L-Shape`, and `S-Shape`.
- Forward and reverse travel direction with persisted state.
- AC green and DC yellow/orange color families.
- Power response from `0kW` through the `0-5%` visible minimum band, continuous mid-range response, and a hard `100%` display cap.

## Completed baseline

- Card-relative SVG paths and canvas rendering.
- Fixed-length moving segments with a solid round head and transparent trailing edge.
- Arc-length track and flow gradients.
- Low-power visibility floor and above-rating visual cap.
- Selector, metric, slider, preset, color, pause, reset, and persistence interactions.
- Shape keyboard navigation, reduced-motion support, static redraw on resize, and embedded SF Pro fonts.
- No-dependency browser smoke test via `npm test`.

## Deferred or unconfirmed

- The narrow-screen toolbar overlap is intentionally out of scope per the latest instruction.
- The inverter model and slider maximum remain fixed at `50kW` until a model-selection requirement is explicitly approved.
- Real telemetry integration, live inverter model discovery, and automatic sign-to-direction mapping are not part of the current demo.

## Candidate next steps

1. Add a model-selection workflow only if multiple inverter ratings must be demonstrated.
2. Expand automated coverage for every combination of path, direction, color, and power band.
3. Add cross-browser visual snapshots for Chrome, Edge, and Safari.
4. Revisit the narrow-screen toolbar layout if mobile support becomes a confirmed requirement.

## Release checklist

1. Run `npm test`.
2. Inspect all three shapes and both directions.
3. Verify AC green and DC yellow/orange labels and colors.
4. Verify `0%`, the `0-5%` minimum band, a mid-range value, `100%`, and a value above `100%`.
5. Pause, resize, resume, and reset.
6. Confirm embedded SF Pro fonts load with no console errors.
7. Publish only when explicitly requested, then verify the Cloudflare production deployment and live file hash.
