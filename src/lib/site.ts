// Category pages and calculators are fixed parts of the site; articles and rates live in Payload.
export const CATEGORIES = [
  {
    slug: 'electricity',
    title: '전기요금',
    lede: '누진 구간, 고지서 항목, 가전별 사용량까지 실제 숫자로 풀어 봅니다.',
    photo: '/photos/electric.webp',
    photoAlt: '아파트 현관 분전함을 휴대폰 불빛으로 확인하는 한국인 남성',
    intro: [
      '주택용 전기요금은 많이 쓸수록 단가가 오르는 누진 구조입니다. 저압 기준으로 7~8월을 뺀 달은 200kWh와 400kWh, 7~8월은 300kWh와 450kWh가 구간 경계입니다.',
      '고지서를 처음 본다면 항목 설명부터, 금액이 왜 뛰었는지 궁금하다면 구간 경계 글부터 읽는 편이 빠릅니다. 내 사용량을 넣어 보면 어느 구간에 있는지 바로 나옵니다.',
    ],
    tool: { href: '/tools/electricity', label: '전기요금 계산하기' },
  },
  {
    slug: 'gas-heating',
    title: '가스·난방',
    lede: '도시가스 단가와 열량 환산, 보일러 설정, 지역난방 구조를 정리했습니다.',
    photo: '/photos/gas.webp',
    photoAlt: '겨울 아침 거실에서 난방 온도조절기를 맞추는 한국인 여성',
    intro: [
      '도시가스 요금은 쓴 부피에 바로 단가를 곱하지 않습니다. 사용량(㎥)을 열량(MJ)으로 바꾼 뒤 지역 공급사의 단가를 곱합니다. 민수용 원료비는 1월부터 두 달마다 조정 대상이 되므로 같은 열량을 써도 달마다 금액이 달라질 수 있습니다.',
      '지역난방 세대는 구조가 달라 면적에 붙는 기본요금과 사용량에 붙는 요금을 봐야 합니다. 난방 방식을 먼저 확인하고 맞는 글을 골라 읽어 보세요.',
    ],
    tool: { href: '/tools/gas', label: '도시가스 요금 계산하기' },
  },
  {
    slug: 'water',
    title: '수도요금',
    lede: '상수도·하수도·물이용부담금의 구성과 아파트 세대 계산, 누수 확인법입니다.',
    photo: '/photos/water.webp',
    photoAlt: '욕실 세면대 수도꼭지를 잠그는 한국인 여성',
    intro: [
      '수도요금 고지서에는 상수도, 하수도, 물이용부담금이 함께 들어 있습니다. 서울은 사용량 구간 없이 단가가 같지만, 부산과 인천은 하수도요금이 사용량에 따라 올라갑니다.',
      '요금이 갑자기 늘었다면 누수 확인과 감면 안내를 먼저, 아파트나 다세대에 산다면 세대 계산 글을 먼저 읽어 보세요.',
    ],
    tool: { href: '/tools/water', label: '서울 수도요금 계산하기' },
  },
  {
    slug: 'support',
    title: '지원·감면',
    lede: '에너지바우처와 복지할인처럼 신청해야 받는 제도를 조건과 함께 안내합니다.',
    photo: '/photos/support.webp',
    photoAlt: '어머니의 신청을 태블릿으로 도와드리는 한국인 딸',
    intro: [
      '전기요금 복지할인은 신청일이 속한 달의 요금부터 적용됩니다. 2026년도 에너지바우처 신청은 12월 31일에 끝나고, 도시가스 경감 고시는 2026년 11월 30일까지 적용되어 12월에 다시 확인해야 합니다.',
      '자격은 제도마다 달라 세대 조건을 먼저 맞춰 봐야 합니다. 글마다 대상과 한도, 중복 규칙, 신청처를 표로 적었습니다.',
    ],
    tool: null,
  },
  {
    slug: 'savings',
    title: '절약 가이드',
    lede: '효과가 큰 순서대로, 얼마나 줄어드는지 계산한 절약 방법입니다.',
    photo: '/photos/bill.webp',
    photoAlt: '식탁 위 빈 명세서와 계산기로 지출을 정리하는 손',
    intro: [
      '절약은 기대 금액부터 따져 보는 편이 좋습니다. 2025년 12월 정부 안내 기준으로 가구당 월평균 절감액은 겨울 난방 20℃ 유지 약 5,150원, 온맵시 10,300원, 플러그 뽑기 778원입니다.',
      '전기는 평소 사용량에 따라 같은 가전도 늘어나는 요금이 달라집니다. 일반론 대신 내 사용량으로 계산해 볼 수 있게 표와 계산기를 함께 두었습니다.',
    ],
    tool: { href: '/tools/appliance', label: '가전 전기요금 계산하기' },
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
