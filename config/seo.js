import {site} from '#config/site.js'
import { loadUserConfig } from '#gulp/utils/load-user-config.js'

const buildAbsoluteUrl = (...parts) => {
  const [origin, ...rest] = parts
  const base = String(origin || '').trim().replace(/\/+$/g, '')
  if (!base) return ''

  const path = rest
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .map(part => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')

  return path ? `${base}/${path}` : base
}

const sitemapUrl = buildAbsoluteUrl(site.siteUrl, site.basePath, 'sitemap.xml')

const baseSeo = {
  trailingSlash: false,

  robots: {
    allowAll: true,
    ...(sitemapUrl ? { content: `User-agent: *\nDisallow:\nSitemap: ${sitemapUrl}\n` } : {}),
  },

  sitemap: {
    mode: 'index',
    changefreq: 'weekly',
    priority: 0.5,
  },

  url: {
    siteUrl: site.siteUrl,
    basePath: site.basePath,
  },
}

export const seo = await loadUserConfig(baseSeo, 'seo')
