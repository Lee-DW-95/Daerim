export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export const siteConfig = {
  name: "지웰대림공인중개사",
  shortName: "지웰",
  url: "https://daerim.com",
  description:
    "청주 지웰시티 1·2·3차와 롯데 오피스텔 전담. 11년차 공인중개사가 데이터로 비교하고 솔직하게 안내합니다.",
  tagline: "지웰시티 전문, 데이터로 증명합니다.",

  agent: {
    name: "이명숙",
    role: "공인중개사",
    yearsOfExperience: 11,
    specialty: "지웰시티 1·2·3차 · 롯데 오피스텔 전담",
    licenseNumber: null as string | null,
    profileImage: null as string | null,
  },

  contact: {
    phone: "010-7744-7835",
    phoneTel: "+82-10-7744-7835",
    kakaoChannelUrl: null as string | null,
    officeAddress: "충북 청주시 흥덕구 대농로 45 근린상가 102호",
    officeHours: "평일 09:30 ~ 19:00 / 주말 예약제",
    /**
     * 사무실 좌표. 카카오 지도 임베드용.
     * 정확한 위치가 필요하면 https://map.kakao.com/?q=대농로+45 에서 확인 후 보정.
     * 현재는 대농로 45 인근 추정값.
     */
    officeLat: 36.63944,
    officeLng: 127.43521,
  },

  links: {
    kakaoChannel: null as string | null,
    naverBlog: null as string | null,
  },
} as const;

export const mainNav: NavItem[] = [
  { title: "홈", href: "/" },
  { title: "단지", href: "/complexes" },
  { title: "도구", href: "/tools" },
  { title: "매물", href: "/listings" },
  { title: "블로그", href: "/blog" },
  { title: "소개", href: "/about" },
  { title: "문의", href: "/contact" },
];

export const complexesNav: NavItem[] = [
  {
    title: "지웰시티 1차",
    href: "/complexes/jiwell-1",
    description: "신영지웰시티 1차 (2010, 주상복합 57층)",
  },
  {
    title: "지웰시티 2차",
    href: "/complexes/jiwell-2",
    description: "두산위브지웰시티 2차 (2015, 평면 개선)",
  },
  {
    title: "지웰시티 3차",
    href: "/complexes/jiwell-3",
    description: "청주지웰시티 푸르지오 (2021, 신축)",
  },
];

export const toolsNav: NavItem[] = [
  {
    title: "단지 비교 대시보드",
    href: "/tools/compare",
    description: "지웰시티 1·2·3차를 시세·학군·교통까지 한눈에 비교",
  },
  {
    title: "실거래가 추이",
    href: "/tools/price-history",
    description: "국토부 실거래가로 최근 3년 추이를 라인 차트로",
  },
  {
    title: "하이닉스 매칭",
    href: "/tools/hynix-matcher",
    description: "직급·가족 구성·예산으로 단지·평형 추천",
  },
  {
    title: "전세 vs 월세 vs 매매",
    href: "/tools/rent-vs-buy",
    description: "내 조건에 가장 유리한 선택을 시나리오 분석",
  },
];
