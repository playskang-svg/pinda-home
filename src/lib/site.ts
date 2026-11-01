// Category pages and calculators are fixed parts of the site; articles and rates live in Payload.
export const CATEGORIES = [
  {
    slug: 'electricity',
    title: '전기요금',
    lede: '누진 구간, 고지서 항목, 가전별 사용량까지 실제 숫자로 풀어 봅니다.',
    photo: '/photos/electric.webp',
    photoAlt: '아파트 현관 분전함을 휴대폰 불빛으로 확인하는 한국인 남성',
  },
  {
    slug: 'gas-heating',
    title: '가스·난방',
    lede: '도시가스 단가와 열량 환산, 보일러 설정, 지역난방 구조를 정리했습니다.',
    photo: '/photos/gas.webp',
    photoAlt: '겨울 아침 거실에서 난방 온도조절기를 맞추는 한국인 여성',
  },
  {
    slug: 'water',
    title: '수도요금',
    lede: '상수도·하수도·물이용부담금의 구성과 아파트 세대 계산, 누수 확인법입니다.',
    photo: '/photos/water.webp',
    photoAlt: '욕실 세면대 수도꼭지를 잠그는 한국인 여성',
  },
  {
    slug: 'support',
    title: '지원·감면',
    lede: '에너지바우처와 복지할인처럼 신청해야 받는 제도를 조건과 함께 안내합니다.',
    photo: '/photos/support.webp',
    photoAlt: '어머니의 신청을 태블릿으로 도와드리는 한국인 딸',
  },
  {
    slug: 'savings',
    title: '절약 가이드',
    lede: '효과가 큰 순서대로, 얼마나 줄어드는지 계산한 절약 방법입니다.',
    photo: '/photos/bill.webp',
    photoAlt: '식탁 위 빈 명세서와 계산기로 지출을 정리하는 손',
  },
] as const

export const TOOLS = [
  {
    href: '/tools/electricity',
    title: '주택용 전기요금 계산기',
    desc: '사용량(kWh)을 넣으면 누진 구간별 금액과 청구액을 항목별로 보여 줍니다.',
    photo: '/photos/meter.webp',
  },
  {
    href: '/tools/appliance',
    title: '가전 전기요금 계산기',
    desc: '가전을 더 쓰면 누진 구간이 바뀌어 요금이 얼마나 늘어나는지 계산합니다.',
    photo: '/photos/appliance.webp',
  },
  {
    href: '/tools/gas',
    title: '도시가스 요금 계산기',
    desc: '지역과 사용량(㎥)을 고르면 열량 환산부터 청구액까지 계산합니다.',
    photo: '/photos/boiler.webp',
  },
  {
    href: '/tools/water',
    title: '수도요금 계산기',
    desc: '상수도·하수도·물이용부담금을 나눠 서울 가정용 기준으로 계산합니다.',
    photo: '/photos/shower.webp',
  },
] as const
