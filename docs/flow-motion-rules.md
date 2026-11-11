# Energy Flow Motion Rules

These rules define the expected behavior of the energy-flow visualization. Keep them stable during visual and interaction iterations.

## 1. Path geometry

- `Straight`: both device cards stay vertically centered; the connector is horizontal.
- `L-Shape`: the source card sits above center, the target card sits below center, and the path exits from the source card bottom.
- `S-Shape`: the source card sits above center, the target card sits below center, and the path exits from the source card side before turning downward.
- `L-Shape` and `S-Shape` must keep the target card at least one visible gap away from the pause control.
- Path start and end points must be calculated from the cards' actual bounding boxes so card-position changes update the connector automatically.

## 2. Track rendering

- The neutral track is rendered in `5px` by default and uses the configured track color.
- Track opacity must be calculated along the path arc length, not from a horizontal page gradient.
- Both path endpoints must fade to transparent near their respective cards.
- The single `Fade` control applies symmetrically to both endpoints.
- The vertical leg of `L-Shape` must fade vertically, not horizontally.

## 3. Moving flow segments

- A flow segment has a fixed visual length while moving; it must not stretch or compress while traveling.
- Segment length is derived from the `Segment Length` setting and normalized against the complete path length.
- A segment starts before the visible path, enters from the source endpoint, follows the path continuously, and exits at the destination endpoint.
- Path clipping may reveal or hide part of a segment at an endpoint, but the segment's color structure and length remain unchanged.
- Segment speed is controlled by the power ratio, `Min Speed`, `Max Speed`, and `Curve Response`.
- Segment thickness is controlled by the power ratio, `Min Width`, and `Max Width`.
- `Line Overlap` controls the delay before the next segment enters.

## 4. Color rendering

- Flow colors are sampled by path arc length, including horizontal, rounded-corner, and vertical portions.
- The color transition must not be calculated from a fixed horizontal gradient.
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
