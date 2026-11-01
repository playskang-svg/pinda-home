import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from './access'

// Rate tables behind the calculators. Editing `data` here changes the calculators without a deploy.
export const Tariffs: CollectionConfig = {
  slug: 'tariffs',
  labels: { singular: '요금표', plural: '요금표' },
  admin: { useAsTitle: 'title', group: '콘텐츠', defaultColumns: ['title', 'effectiveFrom', 'verifiedAt'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    { name: 'title', label: '이름', type: 'text', required: true },
    { name: 'slug', label: '주소', type: 'text', required: true, unique: true, index: true },
    {
      name: 'data',
      label: '요금 데이터',
      type: 'json',
      required: true,
      admin: { description: '계산기가 읽는 값입니다. 구조를 바꾸지 말고 숫자만 고쳐 주세요.' },
    },
    { name: 'effectiveFrom', label: '시행 기준', type: 'text', required: true },
    {
      name: 'verifiedAt',
      label: '확인일',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'sources',
      label: '공식 출처',
      type: 'array',
      fields: [
        { name: 'label', label: '이름', type: 'text', required: true },
        { name: 'url', label: '주소', type: 'text', required: true },
      ],
    },
  ],
}
