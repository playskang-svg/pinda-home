import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from './access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: '카테고리', plural: '카테고리' },
  admin: { useAsTitle: 'title', group: '콘텐츠' },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    { name: 'title', label: '이름', type: 'text', required: true },
    { name: 'slug', label: '주소', type: 'text', required: true, unique: true, index: true },
  ],
}
