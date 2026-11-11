# Energy Flow Motion Rules

These rules define the expected behavior of the energy-flow visualization. Keep them stable during visual and interaction iterations.

## 1. Path geometry

- `Straight`: both device cards stay vertically centered; the connector is horizontal.
- `L-Shape`: the source card sits above center, the target card sits below center, and the path exits from the source card bottom.
- `S-Shape`: the source card sits above center, the target card sits below center, and the path exits from the source card side before turning downward.
- `L-Shape` and `S-Shape` must keep the target card at least one visible gap away from the pause control.
- Path start and end points must be calculated from the cards' actual bounding boxes so card-position changes update the connector automatically.
- Path anchors must extend `8px` inside each card; the card masks the transparent fade and the visible line meets the card edge without a gap.

## 2. Track rendering

- The neutral track is rendered in `5px` by default and uses the configured track color.
- Track opacity must be calculated along the path arc length, not from a horizontal page gradient.
- Both path endpoints must fade to transparent near their respective cards.
- The single `Fade` control applies symmetrically to both endpoints and defaults to `7%`.
- The vertical leg of `L-Shape` must fade vertically, not horizontally.

## 3. Moving flow segments

- A flow segment has a fixed visual length while moving; it must not stretch or compress while traveling.
- Segment length is derived from the `Segment Length` setting and normalized against the complete path length.
- A segment starts before the visible path, enters from the source endpoint, follows the path continuously, and exits at the destination endpoint.
- Path clipping may reveal or hide part of a segment at an endpoint, but the segment's color structure and length remain unchanged.
- Segment speed is controlled by the power ratio, `Min Speed`, `Max Speed`, and `Curve Response`; `Min Speed` defaults to `10px/s`.
- Segment thickness is controlled by the power ratio, `Min Width`, and `Max Width`; `Min Width` defaults to `1.5px`.
- Any nonzero power at or below `5%` of rated power uses the minimum segment width and speed, keeping the flow visible instead of fading into an inactive state.
- Above `5%`, the power-response curve starts from that minimum state and scales continuously toward the configured maximums.
- Exactly `0 kW` remains inactive and shows only the neutral track.
- `Line Overlap` controls the delay before the next segment enters and defaults to `10%`.

## 4. Color rendering

- Flow colors are sampled by path arc length, including horizontal, rounded-corner, and vertical portions.
- The color transition must not be calculated from a fixed horizontal gradient.
- Arc-length color samples must use butt caps with slight overlap so low-opacity tails do not break into dots.
- The leading edge fades from transparent into the configured start color.
- The trailing edge fades to transparent into the background.
- DC and AC use the start, main, and end color settings independently.
- The final trailing fade must remain intact through corners and on vertical segments.

## 5. Interaction and state

- Pause freezes one representative segment and hides the play-state animation without clearing the track.
- Resume restarts the stream using the current power and curve parameters.
- `prefers-reduced-motion` shows a static representative segment.
- Window resizing must recompute the SVG viewBox, card-relative path, canvas dimensions, and rendered track.
- Saved parameters must ignore incompatible old configurations through the curve configuration version.

## 6. Regression checklist

Before publishing, verify:

1. All three path shapes at `0%`, `25%`, and `100%` power.
2. Both AC and DC color modes.
3. Track fades on both endpoints and follows the vertical segment in `L-Shape`.
4. Moving segment length stays constant through every corner.
5. Flow color transitions continuously along the complete path.
6. `L-Shape` and `S-Shape` target cards do not overlap the pause control.
7. Pause, resume, reset, persistence, and responsive resizing.

## 7. UI presentation

- The shape selector uses the same `34px` outer height, `13px` text, black text color, neutral fill, and rounded corners as the AC/DC segmented control.
- The selector is a single-layer gray control with no shadow; its expanded menu may use a separate elevated white surface.
- The gap between the selector and the AC/DC control is `3px`.
- The shape menu and its options use the same `13px` text as the selector trigger; hover and selected states stay neutral, and native blue option highlighting must not be used.
- The selector reserves space on the right for its arrow.
- The battery power value and inverter model use the same `18px` primary text size.
- `Motion` and `Color` section headings use the same `14px` size.
- The live power summary uses one uniform black style, with three values separated by larger gaps and vertical dividers: `−12.04kW | 3.1px | 41px/s`.
