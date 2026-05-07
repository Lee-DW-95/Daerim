# 콘텐츠 추가 가이드

운영자(이명숙 사장님)가 새 매물·블로그 글을 사이트에 올리는 방법을 정리했습니다.

세 가지 길이 있습니다.

| 방법 | 누가 | 난이도 | 반영 시간 |
|---|---|---|---|
| **A. 카톡으로 알려주기** | 운영자 → 개발자 | ★ 쉬움 | 1~2분 |
| **B. GitHub 웹에서 직접 편집** | 운영자 본인 | ★★ 보통 | 자동 1~2분 |
| **C. 로컬에서 편집 후 push** | 개발자 | ★★★ | 즉시 |

매물·글 빈도가 낮으면 **A**가 가장 합리적입니다. 운영자가 직접 시도하시려면 **B**.

---

## 매물 추가하기

**파일**: `data/listings.json` (배열에 객체 하나 추가)

### 최소 필드 (필수)

```json
{
  "slug": "jiwell-1-49-trade-2026-05-15",
  "complexId": "jiwell-1",
  "dealKind": "trade",
  "sizePyeong": 49,
  "currentFloor": 32,
  "totalFloor": 50,
  "direction": "south",
  "priceManwon": 95000,
  "availableFrom": "2026-07-01",
  "status": "available",
  "publishedAt": "2026-05-15",
  "headline": "지웰시티 1차 49평 남향 고층",
  "agentNote": "운영자 코멘트. 강점·약점을 솔직하게.",
  "pros": ["32층 남향", "솔밭초 도보 5분"],
  "cons": ["도배 교체 권장"],
  "features": ["발코니 확장", "시스템 에어컨"],
  "images": []
}
```

### 필드 설명

| 필드 | 값 |
|---|---|
| `slug` | URL에 쓰이는 영문·숫자 식별자. 절대 중복 X. 예: `jiwell-2-39-jeonse-2026-06-01` |
| `complexId` | `jiwell-1` / `jiwell-2` / `jiwell-3` / `lotte-officetel` 중 하나 |
| `dealKind` | `trade`(매매) / `jeonse`(전세) / `monthly`(월세) |
| `sizePyeong` | 한국식 평수. 숫자만. 예: `49` |
| `direction` | `south` / `southeast` / `southwest` / `east` / `west` / `north` |
| `priceManwon` | 만원 단위 정수. 9.5억이면 `95000` |
| `monthlyRentManwon` | 월세일 때만 입력. 보증금은 `priceManwon`에. |
| `availableFrom` | `"즉시"` 또는 `"2026-07-01"` 형식 |
| `status` | `available` / `pending`(협상중) / `sold`(거래완료) |
| `publishedAt` | 매물 등록일 `YYYY-MM-DD`. 정렬용. |
| `images` | `["/listings/<slug>/1.jpg", "..."]` (사진 업로드 후) |

### 사진 등록

1. `public/listings/<slug>/` 폴더 만들기 (slug = 매물의 slug 값)
2. `1.jpg`, `2.jpg`, `3.jpg` 등으로 파일 추가 (대표 사진을 1.jpg로)
3. JSON의 `"images"` 필드에 경로 넣기:
   ```json
   "images": [
     "/listings/jiwell-1-49-trade-2026-05-15/1.jpg",
     "/listings/jiwell-1-49-trade-2026-05-15/2.jpg"
   ]
   ```

사진을 비워두면(`"images": []`) 자리만 표시되며 매물은 정상 노출됩니다.

---

## 블로그 글 추가하기

**파일**: `content/posts/<영문-슬러그>.mdx` (새 파일 생성)

### 글 템플릿

```mdx
---
title: "지웰시티 1차 vs 2차 vs 3차 완벽 비교"
description: "검색 결과·SNS 공유에 보이는 한 줄 요약. 80자 안팎."
date: "2026-05-15"
category: "단지분석"
tags: ["지웰시티", "비교", "1차", "2차", "3차"]
author: "이명숙"
---

여기서부터 글 본문. 마크다운 + 일부 React 컴포넌트 임베드 가능.

## 큰 제목

본문 단락. **굵게**, *기울임*, [링크](/tools/compare) 모두 자연스럽게 동작합니다.

### 작은 제목

- 리스트 항목 1
- 리스트 항목 2

> 인용은 이렇게.

| 표 | 도 | 됩니다 |
|---|---|---|
| 1 | 2 | 3 |
```

### 카테고리 (정확히 입력)

다음 6가지 중 하나만 사용:

- `단지분석`
- `하이닉스`
- `학군`
- `시장분석`
- `거래후기`
- `가이드`

다른 단어는 자동 인식되지 않습니다.

### frontmatter 옵션

| 필드 | 필수 | 설명 |
|---|---|---|
| `title` | ✅ | 글 제목 |
| `description` | ✅ | 한 줄 요약 (메타 description, OG 설명) |
| `date` | ✅ | `YYYY-MM-DD` |
| `category` | ✅ | 위 6개 중 하나 |
| `tags` | — | `["지웰시티", "비교"]` |
| `author` | — | 비우면 사이트 기본값 |
| `ogImage` | — | 직접 만든 OG 이미지 경로. 비우면 자동 생성. |
| `draft` | — | `true`면 사이트에 안 보임 (작성 중) |

### 내부 링크 자주 쓰는 것

```
[비교 대시보드](/tools/compare)
[하이닉스 매칭](/tools/hynix-matcher)
[전체 매물](/listings)
[상담 문의](/contact)
[About](/about)
```

---

## GitHub 웹에서 직접 편집하는 절차 (방법 B)

운영자가 카톡 부탁 없이 직접 추가하고 싶을 때.

### 한 번만: 깃허브 가입 + 권한 받기

1. <https://github.com> 가입 (이메일·아이디만)
2. 개발자에게 깃허브 아이디 알려주기 → "Lee-DW-95/Daerim 저장소 collaborator로 추가" 받기
3. 메일로 초대장 와서 "Accept invitation" 클릭

### 매물·글 추가하는 절차

1. <https://github.com/Lee-DW-95/Daerim> 접속, 로그인
2. 매물이면 `data/listings.json`, 글이면 `content/posts` 폴더 클릭
3. **글 추가**: 폴더 안 우상단 `Add file → Create new file` → 파일명 `<영문-슬러그>.mdx` → 위 글 템플릿 복붙 → 내용 작성
4. **매물 추가**: `listings.json` 파일 클릭 → 연필(Edit) 아이콘 → 마지막 `]` 바로 위에 매물 객체 한 개 추가 (앞 객체 끝에 콤마 잊지 말기)
5. 페이지 맨 아래 `Commit changes` → `Commit directly to the main branch` 체크 → `Commit changes`
6. 1~2분 기다리면 <https://daerim.vercel.app/blog> (또는 `/listings`)에 자동 반영

### 사진 업로드도 동일

1. `public/listings/` 폴더 진입
2. `Add file → Upload files` → 사진 드래그
3. 폴더 이름은 매물의 slug와 똑같이 (URL에 들어갈 영문 식별자)

### 실수했다 싶으면

- 잘못 올린 글: `content/posts/` 폴더에서 해당 mdx 파일 클릭 → 휴지통 아이콘 → `Commit changes`
- 매물 정보 수정: `listings.json` 편집 → 해당 항목만 고치기 → commit

---

## 검수 절차 (모든 방법 공통)

GitHub에 commit이 들어가면 Vercel이 자동으로 빌드를 돌립니다. 1~2분 후:

1. <https://daerim.vercel.app> 들어가서 매물·글이 보이는지 확인
2. 매물 카드 클릭 → 상세 페이지 정상 표시 확인
3. 사진이 있으면 사진 잘 보이는지

빌드가 실패하면 GitHub 저장소 메인 페이지에 ❌ 표시가 뜹니다. 그땐 개발자에게 알려주세요.

---

## 자주 묻는 것

**Q. 글 임시 저장은?**
> frontmatter에 `draft: true` 추가하면 사이트에 안 보입니다. 완성되면 `draft: false`로 바꾸거나 그 줄을 지우세요.

**Q. 매물 거래 완료됐을 때**
> 매물을 지우지 말고 `"status": "sold"`로 바꾸세요. "거래 완료" 배지가 붙어 신뢰도 자료가 됩니다.

**Q. 단지 정보 수정**
> `data/complexes.json`에서 해당 단지 항목 편집. 비교 대시보드, 매칭 도구, 매물 페이지 등 모든 곳에 자동 반영됩니다.

**Q. 운영자 정보·연락처 변경**
> `lib/site-config.ts` 편집. 카카오 채널 URL, 자격증 번호, 사진 경로 등 한 곳에서 관리됩니다.
