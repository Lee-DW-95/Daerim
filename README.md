# 대림공인중개사 · 청주 지웰시티 전문

청주 지웰시티 1·2·3차와 롯데 오피스텔을 전담하는 공인중개사 **이명숙**의
개인 사이트입니다. 매물 리스팅이 아닌 **데이터 기반 의사결정 도구**와
**SK하이닉스 직원 타겟 콘텐츠**로 차별화합니다.

자세한 기획은 [`PRD.md`](./PRD.md)를 참고하세요.

## 기술 스택

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn/ui (new-york, slate base)
- **next-themes** 다크모드, **Pretendard** 한글 폰트, **JetBrains Mono** 숫자
- **Vercel** 배포, **국토부 실거래가 OpenAPI** (Sprint 2)
- 패키지 매니저: **pnpm**

## 로컬 개발

요구사항: Node.js 20+ (현재 24 사용 중), pnpm 10+.

```powershell
pnpm install
pnpm dev
```

기본 주소: <http://localhost:3000>

기타 명령:

```powershell
pnpm build      # 프로덕션 빌드
pnpm start      # 프로덕션 서버 실행
pnpm lint       # ESLint
```

## 디렉토리 구조

```
app/                      # Next.js App Router
  page.tsx                # 홈
  about/                  # 운영자 소개
  contact/                # 문의
  tools/                  # 도구 허브 + 4개 도구 (Sprint 2~3)
  listings/               # 매물 (Sprint 3)
  blog/                   # 블로그 (Sprint 4)
components/
  layout/                 # 헤더/푸터/네비
  ui/                     # shadcn/ui 컴포넌트
  theme-provider.tsx      # next-themes wrapper
  theme-toggle.tsx
  coming-soon.tsx
data/
  complexes.json          # 단지 메타데이터 시드
  schools.json            # 학군 정보
lib/
  site-config.ts          # 운영자 정보·네비·연락처 단일 소스
  data/                   # JSON ↔ 타입 어댑터
  types/                  # TypeScript 타입 정의
  utils.ts                # cn() 등 유틸
```

## 운영자 정보 단일 소스

About/Contact/푸터/메타데이터에 흩뿌려지지 않도록 모든 운영자·연락처
정보는 [`lib/site-config.ts`](./lib/site-config.ts) 하나에 모아둡니다.
다음 항목이 비어 있으면 placeholder가 노출되니 정해지면 이 파일만
업데이트하면 됩니다.

- `agent.licenseNumber` — 공인중개사 등록번호
- `agent.profileImage` — 운영자 프로필 사진 경로
- `contact.kakaoChannelUrl` — 카카오톡 채널 링크
- `links.naverBlog` — 네이버 블로그 URL

## 디자인 토큰

- Primary: `#0F1B2D` (deep navy) — 다크 모드에서는 brand gold가 primary
- Accent: `#C9A961` (warm gold) — CTA에는 `bg-brand-gold` 활용
- Surface: `#FFFFFF` / dark `#0B1220`
- 컬러 토큰은 [`app/globals.css`](./app/globals.css)에서 일괄 관리

## 배포 가이드

### 1) Vercel 첫 배포

1. GitHub에 본 레포지토리를 push (또는 `git remote add origin <url>` 후 push).
2. <https://vercel.com>에서 GitHub 계정으로 로그인.
3. **Add New → Project** → 레포지토리 선택.
4. Framework는 자동으로 Next.js 인식. **Build Command / Output**은 기본값 유지.
5. **Environment Variables**: Sprint 1 단계에서는 비워둬도 됩니다.
   Sprint 2부터 `MOLIT_API_KEY` (국토부 실거래가) 등을 추가합니다.
6. **Deploy** 클릭 → 약 2~3분 후 `*.vercel.app` 서브도메인으로 배포.

### 2) Daerim.com 도메인 연결

1. Vercel 프로젝트 → **Settings → Domains** → `daerim.com` 입력 → **Add**.
2. Vercel이 안내하는 DNS 레코드를 도메인 등록처(가비아/후이즈 등) DNS에 추가.
   - Apex(`daerim.com`): A 레코드 → `76.76.21.21`
   - WWW(`www.daerim.com`): CNAME → `cname.vercel-dns.com`
3. DNS 전파 후 Vercel이 자동으로 SSL 인증서 발급 (Let's Encrypt).
4. Vercel 프로젝트 설정에서 `daerim.com`을 **Primary Domain**으로 지정.

### 3) 자동 배포

`main` 브랜치에 push 하면 Vercel이 자동으로 빌드/배포합니다.
PR 브랜치는 미리보기 URL을 자동으로 생성합니다.

## 로드맵

- [x] Sprint 1: 기초 셋업 (홈/About/Contact 골격, 디자인 토큰, 단지 데이터 시드)
- [ ] Sprint 2: 시그니처 도구 (실거래가 추이 + 단지 비교 대시보드)
- [ ] Sprint 3: 하이닉스 매칭 + 매물 + 시뮬레이터
- [ ] Sprint 4: 블로그 콘텐츠 + SEO

## 라이선스

비공개 / 개인 운영용.
