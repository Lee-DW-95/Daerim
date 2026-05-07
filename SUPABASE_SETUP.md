# Supabase 셋업 가이드

지웰대림공인중개사 사이트의 매물 어드민(`/admin`)은 Supabase를 데이터베이스
+ 인증 + 사진 저장소로 사용합니다. **5분이면 셋업 완료**.

## 0. Supabase 계정·프로젝트 생성

1. <https://supabase.com> 접속 → **Start your project** → GitHub 계정으로 가입
2. **New Project** 클릭
3. 폼 입력:
   - **Name**: `daerim` (또는 임의)
   - **Database Password**: 강력한 비밀번호 (어딘가에 저장)
   - **Region**: `Northeast Asia (Seoul)` ← 한국 사용자라 가장 빠름
   - **Pricing Plan**: Free
4. **Create new project** → 1~2분 대기

## 1. API 키 3개 받기

프로젝트 생성 완료 후:

1. 좌측 사이드바 **Settings (⚙️) → API**
2. 다음 세 값을 복사 (눈 모양 아이콘으로 가려진 값 펼치기):

| Vercel 환경변수 이름 | Supabase에서 표시되는 이름 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys → anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project API keys → service_role secret** |

## 2. 환경변수 등록

### Vercel (프로덕션)

Vercel Dashboard → Daerim 프로젝트 → **Settings → Environment Variables**:
- 위 3개를 모두 추가 (Production / Preview 체크)
- Save

### 로컬 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 3. DB 스키마 실행 (SQL)

1. Supabase Dashboard → 좌측 **SQL Editor** → **New query**
2. 저장소의 [`supabase/schema.sql`](./supabase/schema.sql) 내용 전체 복붙
3. 우측 **Run** (또는 `Ctrl+Enter`)
4. 성공 메시지 확인

이 한 번의 실행으로 다음이 모두 만들어집니다:
- `listings` 테이블 (제약조건·인덱스·트리거 포함)
- RLS 정책 (공개 읽기 + 인증 사용자만 수정)
- `listing-images` 스토리지 버킷 + 권한

## 4. (선택) 시드 매물 마이그레이션

기존 `data/listings.json`의 샘플 매물 2건을 DB로 옮기시려면:

1. SQL Editor → New query
2. [`supabase/seed.sql`](./supabase/seed.sql) 내용 복붙 → Run

샘플 매물이 필요 없으면 이 단계는 생략.

## 5. 운영자 계정 생성

1. Supabase Dashboard → 좌측 **Authentication → Users**
2. **Add user → Create new user**
3. 입력:
   - **Email**: 운영자(이명숙) 이메일
   - **Password**: 강력한 비밀번호
   - **Auto Confirm User**: ✅ 체크 (이메일 인증 생략)
4. Create user

이 계정으로만 `/admin`에 로그인할 수 있습니다.

## 6. Vercel Redeploy

환경변수 추가 후 빌드를 다시 돌려야 반영됩니다:

1. Vercel Dashboard → Deployments → 최신 배포 ⋯ → **Redeploy**
2. ☐ "Use existing Build Cache" **체크 해제** ← 환경변수 변경 시 필수
3. Redeploy → 1~2분 대기

## 7. 동작 확인

1. <https://daerim.vercel.app/admin/login> 접속
2. 5단계에서 만든 운영자 이메일·비밀번호로 로그인
3. **/admin/listings → 새 매물 등록** 버튼
4. 폼 채우고 사진 1~2장 업로드 → 등록
5. 일반 사이트의 `/listings` 새로고침 → 즉시 반영 확인 ✅

---

## 자주 묻는 것

**Q. SQL 실행 시 `permission denied for table objects` 에러**

> Storage 정책 부분에서 발생할 수 있습니다. Supabase 새 프로젝트는 보통 권한 OK인데 안 되면 Dashboard → Storage → Policies에서 직접 정책 추가하세요. (대부분 schema.sql만으로 자동 처리됩니다.)

**Q. 매물을 등록했는데 사이트에 안 보여요**

> Vercel이 ISR로 매물 페이지를 캐시하고 있을 수 있습니다. 어드민에서 등록·수정·삭제 시 자동으로 `revalidatePath`가 호출되니 보통 5초 안에 반영됩니다. 안 되면 강제 새로고침(`Ctrl+Shift+R`).

**Q. 운영자 비밀번호 변경**

> Supabase Dashboard → Authentication → Users → 해당 사용자 행 ⋯ → **Send password reset** 또는 직접 비밀번호 변경.

**Q. 어드민을 운영자 외 사람도 쓰게 하려면**

> Authentication → Users에서 추가 사용자 생성. RLS 정책상 인증된 모든 사용자가 매물 CRUD 가능합니다. 권한 분리가 필요해지면 추후 role 도입.

**Q. 기존 `data/listings.json`은 어떻게 되나요?**

> 그대로 두셔도 됩니다. Supabase 환경변수가 미설정이면 자동으로 JSON fallback이 동작합니다(개발 초기 단계 안전망). DB에 매물이 들어가면 Supabase 데이터가 우선됩니다.

**Q. 데이터 백업**

> Supabase Free 플랜은 7일 자동 백업 포함. 추가로 SQL Editor에서 `select * from listings;` 결과를 CSV export 가능.

**Q. 무료 플랜 한도**

> DB 500MB, Storage 1GB, 월 활성 사용자(어드민 로그인) 50K. 지웰시티 단지 규모로는 평생 무료로 사용 가능합니다.
