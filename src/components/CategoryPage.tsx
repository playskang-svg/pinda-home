import { Breadcrumbs } from '@/components/Breadcrumbs'
import Link from '@/components/Link'
import { PhotoHead } from '@/components/PhotoHead'
import { PostList } from '@/components/PostList'
import { getClient, publishedWhere } from '@/lib/payload'
import type { CATEGORIES } from '@/lib/site'

export async function CategoryPage({ category }: { category: (typeof CATEGORIES)[number] }) {
  const payload = await getClient()
  const found = await payload.find({
    collection: 'categories',
    where: { slug: { equals: category.slug } },
    limit: 1,
  })
  const posts = found.docs[0]
    ? await payload.find({
        collection: 'posts',
        where: { and: [...publishedWhere().and, { category: { equals: found.docs[0].id } }] },
        limit: 50,
        depth: 1,
        sort: '-publishedAt',
      })
    : null

  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: category.title, path: `/${category.slug}` }]} />}
        lede={category.lede}
        photo={category.photo}
        photoAlt={category.photoAlt}
        title={category.title}
      />
      <section className="section">
        <div className="frame">
          <div className="category-intro">
            {category.intro.map((text) => (
              <p key={text}>{text}</p>
            ))}
            <Link className="button" href={category.tool.href}>
              {category.tool.label}
            </Link>
          </div>
          <PostList posts={posts?.docs ?? []} />
        </div>
      </section>
    </>
  )
}
