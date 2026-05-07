-- ============================================================================
-- 샘플 매물 데이터 — 필요 시 직접 실행
--
-- 사이트 첫 셋업 시 매물 카드 디자인 확인용 또는 어드민 동작 테스트용으로
-- 임의의 매물이 필요할 때 사용. 운영 단계에서는 실행하지 않습니다.
--
-- 사용법:
--   1) Supabase Dashboard → SQL Editor → New query
--   2) 이 파일 내용 전체 복붙 → Run
--   3) 사이트의 /listings 또는 /admin/listings에서 확인
--
-- 삭제는 어드민 매물 관리(/admin/listings)에서 행 옆 휴지통 클릭으로 가능.
-- 또는 SQL Editor에서:
--   delete from public.listings where slug like '%-sample';
-- ============================================================================

insert into public.listings (
  slug, complex_id, deal_kind, size_pyeong, exclusive_area_sqm,
  current_floor, total_floor, direction, price_manwon, available_from,
  status, published_at, headline, agent_note, pros, cons, features, images
) values
(
  'jiwell-1-49-trade-sample',
  'jiwell-1', 'trade', 49, 134.91,
  32, 50, 'south', 95000, '2026-07-01',
  'available', '2026-05-07',
  '지웰시티 1차 49평 남향 고층, 도심 뷰 + 솔밭초 배정',
  '1차 49평 남향 매물 중 보기 드문 고층 라인입니다. 큰 가구를 빼고 실측해보면 거실 폭이 같은 평형 다른 라인보다 30cm 정도 더 나옵니다. 다만 입주 후 인테리어 5년 정도 지나서 도배·바닥은 새로 잡으셔야 해요.',
  ARRAY['32층 남향 — 단지 내 동급 최고 라인', '솔밭초 도보 5분, 복대중 도보 10분', '지웰시티몰·현대백화점 도보권'],
  ARRAY['도배·바닥재 교체 권장 (시공비 별도 1,500만원 안팎 예상)', '주상복합 특성상 관리비가 일반 아파트보다 높은 편'],
  ARRAY['2025년 시스템 에어컨 4대 교체', '주방 빌트인 식기세척기 포함', '발코니 확장형'],
  ARRAY[]::text[]
),
(
  'jiwell-2-39-jeonse-sample',
  'jiwell-2', 'jeonse', 39, 84.99,
  18, 28, 'southeast', 50000, '즉시',
  'available', '2026-05-05',
  '지웰시티 2차 39평 남동향, SK하이닉스 출퇴근 12분',
  '신혼부부·자녀 1명 가구에 가장 추천하는 평형입니다. 2차 평면이 1차보다 거실/주방 동선이 깔끔하고, 같은 39평이라도 수납이 더 잘 빠집니다. 보증금 인상 없이 신규 계약 가능합니다.',
  ARRAY['SK하이닉스 청주캠퍼스 차량 12분 (서청주IC 직진)', '신혼·자녀 1명 가구에 최적인 평면', '보증금 인상 없는 신규 계약'],
  ARRAY['주차는 세대당 1대 기준, 추가 차량은 외부 주차 필요'],
  ARRAY['2024년 도배·장판 시공', '발코니 확장형', '현관 중문 설치 완료'],
  ARRAY[]::text[]
)
on conflict (slug) do nothing;
