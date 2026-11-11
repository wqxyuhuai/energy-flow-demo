# Energy Flow Development Rules

This file is the authoritative record of confirmed product, visual, motion, interaction, responsive, and delivery decisions for the energy-flow demo. It was consolidated on 2026-11-11 from the accessible task history, Git history, implementation, and prior rule documents.

An explicit later user decision supersedes these rules. When that happens, update this file in the same change so old and new requirements do not remain in conflict.

## 1. Product and global visual rules

- The demo visualizes power flow for a WattDesk inverter system from the source card on the left to the target inverter card on the right.
- All user-facing copy is in English.
- Use the light visual direction. The page background is `#f5f5f7`; primary surfaces are white; neutral controls use soft gray fills.
- Do not wrap the whole application in another large white panel. The app shell is transparent and unframed.
- Use SF Pro Display with weights `400` and `500`. Do not mix in unrelated display fonts or use heavier weights as visual emphasis.
- Keep the desktop content width at `880px` unless a new responsive requirement explicitly changes it.
- Use restrained radii, thin neutral borders, and very light shadows. Avoid strong outlines, heavy shadows, and colored borders.
- The chart preview is a distinct white surface with a `2px` light-gray border (`#d8dade`), a `16px` radius, and a fixed desktop height of `260px`. The border is intentional so the demo area stands out from the settings area.
- The settings area is a separate white panel with a `18px` radius, a subtle border/shadow, generous top and bottom padding, and no dependency on viewport stretching.
- Keep the section hierarchy clear: `Energy Flow Preview`, `Curve Settings`, `Motion`, and `Color`.

## 2. Typography and component styling

- The page title uses the existing primary heading treatment. Section headings `Motion` and `Color` are `14px`, weight `500`, and pure black.
- The battery power value and inverter model are both `18px`, weight `500`.
- Supporting labels and parameter labels are generally `12px`; small metadata is `11px` or `12px`. Do not promote secondary labels into competing headline sizes.
- Control labels use title case, such as `Min Width`, `Start Pos`, and `Main Pos`.
- The Shape selector and AC/DC selector must share the same perceived control height and typography:
  - Outer height: `34px`.
  - Text: `13px`, pure black.
  - Toolbar gap: `3px`.
  - Shape control: one gray layer, no shadow, `9px` radius, neutral fill.
- The Shape selector is a custom one-layer listbox trigger, not a native `<select>`. The collapsed control and expanded menu must not look like two stacked controls.
- The Shape trigger reserves right-side space for its chevron. The chevron and label must remain vertically centered.
- Shape menu options use the same `13px` text. Hover and selected states use neutral gray fills only; native browser blue highlighting must not appear.
- The AC/DC segmented control uses the same `34px` outer height as Shape. Its buttons are `30px` high inside the compact shell.
- The pause control is a `32px` circular button at the lower-right of the chart preview. Its play and pause icons are solid, visually centered, and equal in weight.
- The three live metrics appear in one restrained line: `−12.04kW | 3.1px | 41px/s`. Use uniform black `13px` text and thin vertical dividers; do not emphasize only one metric.
- Preset buttons use borderless solid fills. Rest, hover, selected, and selected-hover states must remain visibly distinct without outlines.
- Parameter cards, color controls, and Base controls use light neutral fills rather than borders. `#f3f3f3` is the default control-card fill and `#ececee` is the hover fill.
- Color swatches are circular, and hex values sit inside a compact white pill. Swatch diameter should visually match the adjacent value pill height.
- DC and AC color rows must use the same number of controls, the same widths, and the same order: `Start`, `Start Pos`, `Alpha`, `Main`, `Main Pos`, `End`.
- Keep labels and values aligned consistently across all control cards. Avoid uneven card heights or asymmetric spacing inside the same row.

## 3. Layout and responsive behavior

- The chart cards use side-by-side columns on desktop. The device cards should remain compact and centered within the preview rather than filling the full preview height.
- Path shapes may offset the cards, but card placement must support the selected route without collisions.
- The flow path is clipped to the preview surface. The visible line begins and ends at the card edges; do not leave a visible horizontal gap between a card and the line.
- `L-Shape` and `S-Shape` must keep the target card clear of the pause button. Shift cards toward the content area when needed.
- Keep the chart preview and settings panels aligned to the same content width. Do not introduce horizontal scrolling.
- At `760px` and below, color controls collapse from six columns to three columns per group.
- At `560px` and below, motion controls collapse to two columns, chart height is reduced to no more than `230px`, and card typography is reduced so content does not overlap.
- At narrow widths, maintain at least one visible gap between cards, paths, labels, and controls. Reflow or stack rather than clipping content.
- Preserve keyboard focus visibility and semantic button/input elements. Do not remove focus outlines.

## 4. Path geometry

- `Straight`: both device cards stay vertically centered; the connector is horizontal.
- `L-Shape`: the source card sits above center, the target card sits below center, and the path exits from the source card bottom.
- `S-Shape`: the source card sits above center, the target card sits below center, and the path exits from the source card side before turning downward.
- `L-Shape` and `S-Shape` must keep the target card at least one visible gap away from the pause control.
- Path start and end points must be calculated from the cards' actual bounding boxes so card-position changes update the connector automatically.
- Path anchors must extend `8px` inside each card; the card masks the transparent fade and the visible line meets the card edge without a gap.
- All shape variants use orthogonal routing with small rounded corners. Do not replace them with arbitrary freeform curves.
- Flow direction is left to right.

## 5. Track rendering

- The neutral track is rendered in `5px` by default and uses the configured track color.
- Track opacity must be calculated along the path arc length, not from a horizontal page gradient.
- Both path endpoints must fade to transparent near their respective cards.
- The single `Fade` control applies symmetrically to both endpoints and defaults to `7%`.
- The vertical leg of `L-Shape` must fade vertically, not horizontally.
- Track sampling must overlap slightly and use butt caps so the low-opacity edge does not break into visible dots.

## 6. Moving flow segments

- A flow segment has a fixed visual length while moving; it must not stretch or compress while traveling.
- Segment length is derived from the `Segment Length` setting and normalized against the complete path length.
- A segment starts before the visible path, enters from the source endpoint, follows the path continuously, and exits at the destination endpoint.
- Path clipping may reveal or hide part of a segment at an endpoint, but the segment's color structure and length remain unchanged.
- The line is revealed and hidden by the card/container masks like a fixed-length object passing under the cards. Do not animate the stroke itself as a growing or shrinking line.
- Keep the number of simultaneous fully visible segments low. The next segment should enter shortly before the previous one has completely left, controlled by `Line Overlap`; do not wait for a full blank interval, and do not fill the path with many independent packets.
- Segment speed is controlled by the power ratio, `Min Speed`, `Max Speed`, and `Curve Response`; `Min Speed` defaults to `10px/s`.
- Segment thickness is controlled by the power ratio, `Min Width`, and `Max Width`; `Min Width` defaults to `1.5px`.
- Any nonzero power at or below `5%` of rated power uses the minimum segment width and speed, keeping the flow visible instead of fading into an inactive state.
- Above `5%`, the power-response curve starts from that minimum state and scales continuously toward the configured maximums.
- Exactly `0 kW` remains inactive and shows only the neutral track.
- `Line Overlap` controls the delay before the next segment enters and defaults to `10%`.

## 7. Power response and defaults

- Power percentage is calculated from absolute power divided by the inverter model's maximum power. A `50 kW` model and a `30 kW` model therefore map the same percentage to different absolute kW values.
- Negative power uses the absolute value for line thickness and speed; the sign remains visible in the power readout.
- Above the rated maximum, the visual response is capped at the configured maximums while the power readout may indicate that the value exceeds the model rating.
- Current default curve settings:

| Setting | Default | Range or note |
| --- | ---: | --- |
| Min Width | `1.5px` | `1–4px` |
| Max Width | `5px` | default visual maximum; slider allows tuning up to `8px` |
| Track Width | `5px` | `2–8px` |
| Min Speed | `10px/s` | `0–40px/s` |
| Max Speed | `90px/s` | slider maximum remains `110px/s` |
| Segment Length | `70%` | `40–85%` |
| Line Overlap | `10%` | `0–45%` |
| Curve Response | `0.70` | `0.50–1.00` |
| Track Fade | `7%` | one symmetrical endpoint fade |

- The `5%` low-power floor is a behavioral rule, not a temporary demo preset. Do not reintroduce the older threshold that suppressed the line at very small nonzero power.
- Changing a default is a product decision. Do not silently change defaults while tuning another control.

## 8. Color rendering

- Flow colors are sampled by path arc length, including horizontal, rounded-corner, and vertical portions.
- The color transition must not be calculated from a fixed horizontal gradient.
- Arc-length color samples must use butt caps with slight overlap so low-opacity tails do not break into dots.
- The leading edge fades from transparent into the configured start color.
- The trailing edge fades to transparent into the background.
- DC and AC use the start, main, and end color settings independently.
- The final trailing fade must remain intact through corners and on vertical segments.
- The moving segment's color pattern is anchored to the segment and moves with it; it is not a page-level gradient that stays fixed while the line travels.
- Current color defaults:

| Group | Start | Start Pos | Alpha | Main | Main Pos | End |
| --- | --- | ---: | ---: | --- | ---: | --- |
| DC | `#9DFF00` | `22%` | `100%` | `#12E415` | `55%` | `#11E614` |
| AC | `#FFF700` | `12%` | `24%` | `#FF9500` | `36%` | `#FF7300` |

- Track color defaults to `#ECECEC`.
- Keep the AC yellow transition restrained. Increasing its opacity or share enough to dominate the orange body is a regression.

## 9. Interaction and state

- Pause freezes one representative segment and hides the play-state animation without clearing the track.
- Resume restarts the stream using the current power and curve parameters.
- `prefers-reduced-motion` shows a static representative segment.
- Window resizing must recompute the SVG viewBox, card-relative path, canvas dimensions, and rendered track.
- Saved parameters must ignore incompatible old configurations through the curve configuration version.
- The Shape menu closes after selection, on outside click, and on `Escape`; focus returns to the trigger after `Escape` or selection.
- Sliders must enlarge slightly on hover/focus for easier manipulation. Primary power slider: `4px` track and `14px` thumb at rest, `5px` track and `16px` thumb on hover/focus. Parameter sliders use the compact equivalent.
- Slider tracks and thumbs are neutral gray (`#b3b3b6`, `#e1e1e3`, `#a3a3a6`) and have fully rounded ends. Do not use square slider ends or strong dark-gray thumbs.
- Preset and control state changes use short eased transitions, approximately `140–180ms`; avoid abrupt color changes.
- `Reset` restores the curve defaults. It must not erase unrelated controls unless a broader reset behavior is explicitly requested.

## 10. Development and delivery conventions

- Keep the production demo self-contained in `index.html`, including CSS, JavaScript, and the SF Pro font data.
- The GitHub repository is `energy-flow-demo`; the Cloudflare Pages project is also `energy-flow-demo`; the public subdomain is `flow.carlwang.cn`.
- Pushing to `main` may deploy automatically. Never push or deploy unless the user explicitly requests publication in the current task.
- Local iteration takes precedence over publication. Verify the local preview before proposing a release.
- Keep `_headers` configured with `Cache-Control: no-store` while this remains an iteration-heavy preview, unless the user explicitly changes the caching policy.
- Do not edit generated or deployed copies independently. The repository `index.html` and this rule document are the canonical sources.
- The preview must remain usable as a direct local HTML file and must not depend on a dev server or external font files.
- When a visual decision is finalized, update this document in the same task. Do not leave important behavior only in chat history.

## 11. Rejected approaches and regression guards

- Do not draw flow as many simultaneous dashes or multiple always-visible lines.
- Do not grow or shrink the moving segment along the path. Apparent length change may only come from clipping at the card/preview edges.
- Do not use round caps as a shortcut for endpoint fade; they create visible dots at the head and tail.
- Do not use a horizontal CSS gradient for a path that turns or runs vertically.
- Do not keep separate Fade In and Fade Out controls. Use the single symmetric `Fade` parameter.
- Do not reintroduce a native browser select that exposes blue or OS-specific option highlighting.
- Do not wrap the whole UI in a large white outer card.
- Do not use arbitrary Bezier/curved route shapes. `Straight`, `L-Shape`, and `S-Shape` are orthogonal with small rounded corners.
- Do not hide the flow at low but nonzero power. The `5%` floor exists specifically to prevent that regression.
- Do not change default values merely to compensate for an implementation bug; fix the implementation against these rules.

## 12. Regression checklist

Before publication, verify:

1. All three path shapes at `0%`, a value inside the `0–5%` floor band, `25%`, and `100%` power.
2. Both AC and DC color modes.
3. Track fades on both endpoints and follows the vertical segment in `L-Shape`.
4. Moving segment length stays constant through every corner.
5. Flow color transitions continuously along the complete path.
6. `L-Shape` and `S-Shape` target cards do not overlap the pause control.
7. Low but nonzero power shows a moving line at `1.5px` and `10px/s`; exact `0 kW` shows no moving line.
8. Pause, resume, reset, persistence, and responsive resizing.
9. Shape and AC/DC controls have matching height, typography, alignment, and spacing.
10. No clipped controls, overlapping cards, horizontal overflow, visible browser-default option styling, or dot-like line tails.
