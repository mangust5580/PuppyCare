export default {
  site: {
    siteUrl: process.env.SITE_URL || 'https://mangust5580.github.io',
    basePath: process.env.SITE_BASE_PATH || '/PuppyCare',
    name: 'PuppyCare',
    shortName: 'PuppyCare',
  },

  engines: {
    templates: 'nunjucks',
    styles: 'scss',
    scripts: 'esbuild',
  },

  images: {
    // AVIF/WebP must be emitted in both dev and prod. A <picture> source that
    // points to a missing modern format will not fall back to <img> gracefully.
    dev: {
      formats: { webp: true, avif: true },
    },
    prod: {
      formats: { webp: true, avif: true },
    },
    rules: [],
  },

  features: {
    svgSprite: {
      enabled: true,
    },

    media: {
      // Video is transcoded by the build (ffmpeg-static): the source stays a
      // single MP4 (src/assets/video/video-1.mp4) and the production build emits
      // the generated WebM + optimized MP4 (+ poster/thumb) into public/video/.
      // No WebM is committed to src. Dev keeps 'copy' for fast rebuilds.
      video: { devMode: 'copy', buildMode: 'transcode' },
    },
  },
}
