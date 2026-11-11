# Energy Flow Demo

Interactive preview for the WattDesk inverter energy-flow visualization.

## Live site

https://flow.carlwang.cn

## Local preview

Open `index.html` directly in a browser. All styles, scripts, and SF Pro font assets are self-contained in the HTML file.

## Smoke test

Run `npm test` with Google Chrome installed. The test uses the local Chrome DevTools Protocol and has no package dependencies.

## Cloudflare Pages

The repository is connected to the Cloudflare Pages project `energy-flow-demo`. Pushes to `main` deploy the site automatically.

## Implementation rules

Read [AGENTS.md](AGENTS.md) before modifying the project, then use [docs/flow-motion-rules.md](docs/flow-motion-rules.md) as the detailed source of truth for product, visual, animation, interaction, responsive, and delivery rules.

See [docs/project-plan.md](docs/project-plan.md) for current scope, deferred items, candidate next steps, and the release checklist.
