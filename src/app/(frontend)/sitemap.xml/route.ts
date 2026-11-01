import { getClient, publishedWhere, SITE_URL } from '@/lib/payload'
import { CATEGORIES, TOOLS } from '@/lib/site'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = ['', '/tools', '/rates', '/posts', ...TOOLS.map((tool) => tool.href), ...CATEGORIES.map((c) => `/${c.slug}`)]

export async function GET() {
  const payload = await getClient()
  const [posts, pages] = await Promise.all([
    payload.find({ collection: 'posts', where: publishedWhere(), limit: 2000, depth: 0, pagination: false }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, pagination: false }),
  ])
  const urls = [
    ...STATIC_PATHS.map((path) => `<url><loc>${SITE_URL}${path}</loc></url>`),
    ...pages.docs.map(
      (page) => `<url><loc>${SITE_URL}/${page.slug}</loc><lastmod>${page.updatedAt}</lastmod></url>`,
    ),
    ...posts.docs.map(
      (post) =>
        `<url><loc>${SITE_URL}/posts/${post.slug}</loc><lastmod>${post.updatedAt}</lastmod></url>`,
    ),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
