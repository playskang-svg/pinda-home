// Rates read from official pages on 2026-11-01. Admin edits live in /admin; re-running the seed overwrites them.
import type { ElectricData, GasData, WaterData } from '../src/lib/calc'

const electricity: ElectricData = {
  low: {
    normal: [
      { upTo: 200, base: 910, rate: 120.0 },
      { upTo: 400, base: 1600, rate: 214.6 },
      { upTo: null, base: 7300, rate: 307.3 },
    ],
    summer: [
      { upTo: 300, base: 910, rate: 120.0 },
      { upTo: 450, base: 1600, rate: 214.6 },
      { upTo: null, base: 7300, rate: 307.3 },
    ],
    superUserRate: 736.2,
    minimumCharge: 1000,
  },
  high: {
    normal: [
      { upTo: 200, base: 730, rate: 105.0 },
      { upTo: 400, base: 1260, rate: 174.0 },
      { upTo: null, base: 6060, rate: 242.3 },
    ],
    summer: [
      { upTo: 300, base: 730, rate: 105.0 },
      { upTo: 450, base: 1260, rate: 174.0 },
      { upTo: null, base: 6060, rate: 242.3 },
    ],
    superUserRate: 601.3,
    minimumCharge: 0,
  },
  superUserOver: 1000,
  climatePerKwh: 9.0,
  fuelPerKwh: 5.0,
  vatRate: 0.1,
  fundRate: 0.027,
}

const SEOUL_GAS = 'https://www.seoulgas.co.kr/front/payment/gasPayTable'
const GAS_ASSOCIATION = 'http://www.citygas.or.kr/info/charge.jsp'

const cityGas: GasData = {
  regions: [
    { id: 'seoul', name: '서울', supplier: '서울도시가스 등', baseHeat: 1250, baseCook: 1250, rateCook: 22.5268, rateHeat: 22.5268, effective: '2026년 10월 1일', sourceLabel: '서울도시가스 요금표', sourceUrl: SEOUL_GAS },
    { id: 'gyeonggi', name: '경기', supplier: '서울도시가스 경기권 등', baseHeat: 1250, baseCook: 1250, rateCook: 22.6226, rateHeat: 22.6226, effective: '2026년 10월 1일', sourceLabel: '서울도시가스 요금표', sourceUrl: SEOUL_GAS },
    { id: 'incheon', name: '인천', supplier: '인천도시가스', baseHeat: 1000, baseCook: 1000, rateCook: 22.5084, rateHeat: 22.5084, effective: '2026년 10월 1일', sourceLabel: '한국도시가스협회 소매요금표', sourceUrl: GAS_ASSOCIATION },
    { id: 'busan', name: '부산', supplier: '부산도시가스', baseHeat: 900, baseCook: 900, rateCook: 23.2186, rateHeat: 23.2186, effective: '2026년 10월 1일', sourceLabel: '한국도시가스협회 소매요금표', sourceUrl: GAS_ASSOCIATION },
    { id: 'daegu', name: '대구', supplier: '대성에너지', baseHeat: 900, baseCook: 1490, rateCook: 23.7742, rateHeat: 23.7742, effective: '2026년 11월 1일', sourceLabel: '대성에너지 요금표', sourceUrl: 'https://cyber.daesungenergy.com/charge/pricetable' },
    { id: 'gwangju', name: '광주', supplier: '해양에너지 광주권', baseHeat: 750, baseCook: 750, rateCook: 22.0252, rateHeat: 23.297, effective: '2026년 11월 1일', sourceLabel: '해양에너지 요금 공지', sourceUrl: 'https://www.hyenergy.co.kr/promotion/notice_view.asp?intSeq=1613' },
    { id: 'daejeon', name: '대전', supplier: '씨엔씨티에너지', baseHeat: 850, baseCook: 850, rateCook: 23.2332, rateHeat: 24.074, effective: '2026년 11월 1일', sourceLabel: '씨엔씨티에너지 요금표', sourceUrl: 'https://www.cncityenergy.com/jsp/customer/chargeInfoGas.jsp' },
    { id: 'ulsan', name: '울산', supplier: '경동도시가스', baseHeat: 778, baseCook: 778, rateCook: 22.877, rateHeat: 22.877, effective: '2026년 11월 1일', sourceLabel: '경동도시가스 요금표', sourceUrl: 'https://www.kdgas.co.kr/kdgas/customer/gasInfo/ulsan.do?mId=001001004003001001' },
    { id: 'sejong', name: '세종', supplier: 'JB', baseHeat: 820, baseCook: 2533, rateCook: 22.3077, rateHeat: 24.4906, effective: '2026년 10월 1일', sourceLabel: '한국도시가스협회 소매요금표', sourceUrl: GAS_ASSOCIATION },
  ],
  cookLimitMj: 516,
  vatRate: 0.1,
  defaultMjPerM3: 42.7,
  minMjPerM3: 41.0,
  maxMjPerM3: 44.4,
}

const waterSeoul: WaterData = {
  waterRate: 580,
  sewerRate: 480,
  sewerSchedule: [
    { from: '2026년', rate: 480 },
    { from: '2027년', rate: 560 },
    { from: '2028년', rate: 630 },
    { from: '2029년', rate: 700 },
    { from: '2030년', rate: 770 },
  ],
  useCharge: 170,
  meterCharge: [
    { mm: 15, charge: 1080 },
    { mm: 20, charge: 3000 },
    { mm: 25, charge: 5200 },
    { mm: 32, charge: 9400 },
    { mm: 40, charge: 16000 },
    { mm: 50, charge: 25000 },
  ],
}

// Display only. Busan and Incheon sewer rates step up with use, so they stay out of the calculator.
const waterCities = {
  rows: [
    { city: '서울', water: '580', meter20: '3,000', sewer: '480', use: '170', basis: '2026년 1월 사용분', sourceUrl: 'https://i121.seoul.go.kr/cyber/front/cgcalc/NR_chargeTypeTariffInfo.do?_m=m5_5' },
    { city: '부산', water: '920', meter20: '2,200', sewer: '580~1,110 (사용량 구간별)', use: '149.8 (납기별 변동)', basis: '2026년 2월 납기분', sourceUrl: 'https://www.busan.go.kr/water/wtchargeguide03' },
    { city: '인천', water: '620', meter20: '2,400', sewer: '410~1,030 (사용량 구간별)', use: '170', basis: '2026년 확인', sourceUrl: 'https://www.incheon.go.kr/water/WA060303' },
    { city: '대구', water: '690', meter20: '2,400', sewer: '540', use: '159.6', basis: '2026년 9월 고지분', sourceUrl: 'https://cyber.dgwater.go.kr/cps/cps200/cps24001.do?_pgmId=CPS240_01' },
    { city: '광주', water: '640 (12월 납기부터 700)', meter20: '2,000', sewer: '470 (12월 납기부터 510)', use: '169.66', basis: '2025년 12월 납기분', sourceUrl: 'https://water.jeonnam-gwangju.go.kr/smart/loadPage.its?jspPage=%2FSMT%2FB%2FSMTB010&menuId=400103' },
  ],
}

const districtHeating = {
  basePerM2: 52.4,
  single: 112.32,
  spring: 110.04,
  summer: 99.02,
  winter: 115.59,
  cooling: 25.11,
}

export const tariffs = [
  {
    slug: 'electricity-residential',
    title: '주택용 전기요금',
    data: electricity,
    effectiveFrom: '저압 2024년 1월 1일, 고압 2023년 11월 9일. 연료비조정액은 2026년 10~12월분',
    sources: [
      { label: '한전ON 전기요금표', url: 'https://online.kepco.co.kr/PRM005D00' },
      { label: '한전ON 전기요금 구조', url: 'https://online.kepco.co.kr/PRM004D00' },
      { label: '한전ON 전기요금계산기', url: 'https://online.kepco.co.kr/PRM033D00' },
      { label: '한국전력 2026년 4분기 연료비조정단가 공지', url: 'https://www.kepco.co.kr/home/media/newsroom/notice/boardView.do?boardMngNo=14&boardNo=2759' },
    ],
  },
  {
    slug: 'city-gas',
    title: '주요 지역 도시가스 주택용 요금',
    data: cityGas,
    effectiveFrom: '지역별 2026년 10월 1일 또는 11월 1일',
    sources: [
      { label: '서울도시가스 요금표', url: SEOUL_GAS },
      { label: '한국도시가스협회 소매요금표', url: GAS_ASSOCIATION },
      { label: '대성에너지 요금 계산 방법', url: 'https://cyber.daesungenergy.com/charge/pricecalcguide' },
      { label: '한국가스공사 도시가스 열량제도', url: 'https://www.kogas.or.kr/site/koGas/1040500000000' },
    ],
  },
  {
    slug: 'water-seoul',
    title: '서울 가정용 수도요금',
    data: waterSeoul,
    effectiveFrom: '상수도 2023년 1월 1일, 하수도 2026년 1월 1일, 물이용부담금 2011년 1월 1일',
    sources: [
      { label: '서울아리수본부 요율표', url: 'https://i121.seoul.go.kr/cyber/front/cgcalc/NR_chargeTypeTariffInfo.do?_m=m5_5' },
      { label: '서울아리수본부 요금 계산', url: 'https://i121.seoul.go.kr/cyber/front/cgcalc/NR_cgCalcHomePurpose.do?_m=m1_3_1' },
    ],
  },
  {
    slug: 'water-cities',
    title: '주요 도시 가정용 수도요금',
    data: waterCities,
    effectiveFrom: '도시별 표기',
    sources: [
      { label: '부산 상수도사업본부', url: 'https://www.busan.go.kr/water/wtchargeguide03' },
      { label: '인천 상수도사업본부', url: 'https://www.incheon.go.kr/water/WA060303' },
      { label: '대구 상수도사업본부', url: 'https://cyber.dgwater.go.kr/cps/cps200/cps24001.do?_pgmId=CPS240_01' },
      { label: '전남광주 상수도사업본부', url: 'https://water.jeonnam-gwangju.go.kr/smart/loadPage.its?jspPage=%2FSMT%2FB%2FSMTB010&menuId=400103' },
    ],
  },
  {
    slug: 'district-heating',
    title: '한국지역난방공사 주택용 열요금',
    data: districtHeating,
    effectiveFrom: '2024년 7월 1일',
    sources: [{ label: '한국지역난방공사 열요금표', url: 'https://www.kdhc.co.kr/kdhc/main/contents.do?menuNo=200270' }],
  },
]
