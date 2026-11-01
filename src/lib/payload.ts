import config from '@payload-config'
import { getPayload } from 'payload'

export const getClient = () => getPayload({ config })

export const SITE_URL = 'https://pinda.kr'
export const SITE_NAME = '살림핀다'
export const SITE_TITLE = `${SITE_NAME} — 전기·가스·수도 요금 계산과 절약 안내`
export const SITE_DESCRIPTION =
  '살림핀다는 전기·도시가스·수도 요금을 공식 요금표로 직접 계산해 보고, 고지서 읽는 법과 감면 제도, 절약 방법을 근거와 함께 정리하는 생활요금 안내 사이트입니다.'
export const ADSENSE_CLIENT = 'ca-pub-4030620718116834'

export const publishedWhere = () => ({
  and: [
    { _status: { equals: 'published' as const } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
  ],
})

// Media URLs already carry serverURL in production and are relative elsewhere.
export const absoluteUrl = (url: string): string => (url.startsWith('http') ? url : `${SITE_URL}${url}`)
