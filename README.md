# PuppyCare

PuppyCare is a multi-page static portfolio demo for a fictional pet care clinic. It is built with Gulp 5, Nunjucks, SCSS and vanilla JavaScript, with a production pipeline for GitHub Pages.

- Repository: https://github.com/mangust5580/PuppyCare
- Live demo: https://mangust5580.github.io/PuppyCare/
- Production output: `public/`
- Deploy: GitHub Actions uploads `public/` as the GitHub Pages artifact.

## Production Disclaimer

This is a static demo project. It has no backend, no production form handling and no real clinic, client, patient or appointment data. Forms and modal flows are portfolio interactions only and must be connected to a real backend or form service before commercial use.

## Pages And Features

- Home page with clinic overview and primary calls to action.
- About page.
- Services page.
- Service detail page.
- Team page.
- Pricing page.
- Reviews page.
- Appointment page.
- FAQ page.
- Blog index.
- Blog detail page.
- Contacts page.
- Locations page.
- Privacy policy page.
- Terms page.
- Custom 404 page.

## Stack

- Gulp 5 build pipeline.
- Nunjucks templates and reusable partials.
- SCSS architecture with project tokens, helpers, components, sections and pages.
- Vanilla JavaScript modules bundled through esbuild.
- Responsive image pipeline with generated WebP and AVIF variants.
- SVG sprite generation.
- Source MP4 video with generated WebM and optimized video output.
- GitHub Actions and GitHub Pages deployment.

## JavaScript Interactions

- Header behavior, burger navigation and dropdown menus.
- Modal dialogs.
- Demo form flows and client-side validation states.
- FAQ and accordion interactions where used.
- Video controls where media sections are present.

## Accessibility

- Skip link and semantic landmarks.
- Form labels and explicit required states.
- Keyboard-visible focus states through `:focus-visible`.
- Modal dialog behavior with ARIA state handling.
- Reduced-motion handling for motion-sensitive users.

## Responsive Layout

- Layout supports narrow screens down to 320px.
- Fluid spacing and type are handled through the shared SCSS system.
- Internal links are designed to remain GitHub Pages-safe and relative to the deployed project path.

## Images And Video

- Source images use high-density `@2x` assets where appropriate.
- The build generates responsive WebP and AVIF variants.
- SVG icons are optimized and assembled into a sprite.
- Source MP4 files can be transcoded into WebM and optimized output by the build pipeline.
- Image markup should preserve useful alt text and avoid layout shift with explicit dimensions where applicable.

## SEO

- Pages include project-specific titles and descriptions.
- Canonical, Open Graph and Twitter metadata are generated from project data.
- Sitemap and robots files are generated for production output.
- The 404 page is excluded from indexing.

## Commands

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run check
npm run preview
```

`npm run check` runs linting and the production build.

## GitHub Pages

1. Open repository Settings -> Pages.
2. Set Build and deployment -> Source to GitHub Actions.
3. Push changes to `main`.
4. Wait for the "Deploy GitHub Pages" workflow to finish.
5. Open https://mangust5580.github.io/PuppyCare/.

The workflow builds the project, adds `public/.nojekyll` during CI, uploads `public/` with `actions/upload-pages-artifact`, and deploys it with `actions/deploy-pages`. It does not create a `gh-pages` branch and does not commit generated files.

CI runs `npm ci` and `npm run check` with `SITE_URL=https://mangust5580.github.io` and `SITE_BASE_PATH=/PuppyCare`.

## Structure

- `src/pages` - page entry files.
- `src/shared` - reusable Nunjucks partials.
- `src/styles` - SCSS architecture.
- `src/scripts` - JavaScript entry and modules.
- `src/assets` - project fonts, images, icons, audio and video.
- `config` - project and pipeline configuration.
- `gulp` - build implementation.

## License

MIT License. See [LICENSE](LICENSE).
