-- Celimax US action tracker, anonymous shared editing.
-- Run this entire file in the target project's Supabase SQL Editor.
-- Re-running it keeps existing assignees, dates, completion states and results.
BEGIN;

CREATE TABLE IF NOT EXISTS public.celimax_action_items (
  task_id text PRIMARY KEY,
  product_name text NOT NULL,
  area text NOT NULL DEFAULT '',
  action_title text NOT NULL,
  assignee text NOT NULL DEFAULT '' CHECK (char_length(assignee) <= 120),
  planned_date date CHECK (planned_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
  is_done boolean NOT NULL DEFAULT false,
  result text NOT NULL DEFAULT '' CHECK (char_length(result) <= 3000),
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.celimax_action_items_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.revision := OLD.revision + 1;
  NEW.updated_at := pg_catalog.clock_timestamp();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.celimax_action_items_touch() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS celimax_action_items_touch ON public.celimax_action_items;
CREATE TRIGGER celimax_action_items_touch
  BEFORE UPDATE ON public.celimax_action_items
  FOR EACH ROW EXECUTE FUNCTION public.celimax_action_items_touch();

INSERT INTO public.celimax_action_items (task_id, product_name, area, action_title) VALUES
  ('product-retinal-booster-sheet-f57d73b52493', '레티날부스터', '판매 근거 / A+', 'A+ 최상단에 경쟁사와 같이 최신 데이터로 판매량 Proof 강조 -'),
  ('product-retinal-booster-sheet-57dd115d4488', '레티날부스터', '핵심 문구', 'Key Message에 성분+함량 뿐 아니라 효능 위주의 설명 강조 추가'),
  ('product-retinal-booster-sheet-999773ea6564', '레티날부스터', '정품 안내', '아마존 제품 페이지 또는 공식홈페이지에 최근 위조 리셀러들의 위조 사례 소개 (QR URL의 미세한 차이, 제품 비율의 차이 등)'),
  ('product-retinal-booster-sheet-cbd23d3b2c56', '레티날부스터', '제품 조합 / 이미지', 'A+ / 썸네일 이미지 마지막 장표에는 함께 활용하면 좋은 성분 및 celimax 제품 소개'),
  ('product-retinal-booster-sheet-ca6dc40ea032', '레티날부스터', '키워드 추적', 'USP / 부위 / 성분별 키워드 구분하여 성과 트래킹 및 테스트 진행'),
  ('product-retinal-booster-sheet-0d10b370e5e0', '레티날부스터', '경쟁 제품 / 광고', '메디테라피 (B0DG4WXBCF)를 1순위 경쟁제품으로 설정하여 제품페이지 랭킹 점수 주기적 분석 비교 및 SB/SP 캠페인 타겟 트래킹,'),
  ('product-dark-spot-cream-sheet-1bd8896de74f', '모공잡티크림', '성분 / 임상', '성분 함량과 임상 근거 확인'),
  ('product-dark-spot-cream-sheet-8593fb66ce68', '모공잡티크림', '문구 / SEO', 'Title과 Bullet 수정'),
  ('product-dark-spot-cream-sheet-1ba083b34a83', '모공잡티크림', '문구 구성', 'Title과 Item Highlights 역할 분리'),
  ('product-dark-spot-cream-sheet-af81058fd3a3', '모공잡티크림', '성분 이미지', '5%-5%-1% 포뮬러를 이미지로 시각화'),
  ('product-dark-spot-cream-sheet-3fd239a1491f', '모공잡티크림', '임상 이미지 / A+', '임상 결과를 상단 이미지와 A+에 반영'),
  ('product-dark-spot-cream-sheet-f14b361b1db0', '모공잡티크림', '표현 검토', '어색하거나 강한 표현 검토'),
  ('product-dark-spot-cream-sheet-bb1de5d55880', '모공잡티크림', '사용법', '사용법과 민감 피부 안내 보강'),
  ('product-dark-spot-cream-sheet-ee81f4064390', '모공잡티크림', '검색 광고', '검색 의도별 광고 캠페인 분리'),
  ('product-dark-spot-cream-sheet-d726c1b5ed7b', '모공잡티크림', '상품 타겟 광고', '경쟁 제품 상품 타깃 광고 테스트'),
  ('product-dark-spot-cream-sheet-6739c75adc71', '모공잡티크림', '성과 확인', '변경 전후 성과 확인'),
  ('product-body-pad-sheet-56eab4900e42', 'TXA 바디패드', '제품 정보 / 근거', '제품 정보와 표현 근거 확인'),
  ('product-body-pad-sheet-aa79b8cf5055', 'TXA 바디패드', '문구 / SEO', 'Title과 Bullet 수정'),
  ('product-body-pad-sheet-32c2dfcef4d7', 'TXA 바디패드', '성분 / 구조 이미지', '성분과 듀얼 패드 구조를 이미지로 안내'),
  ('product-body-pad-sheet-3528a8d7b1b3', 'TXA 바디패드', '사용 부위', '사용 부위와 사용 상황을 구체화'),
  ('product-body-pad-sheet-16cfb07ff54b', 'TXA 바디패드', '근거 / PDP', '신뢰 근거를 PDP에 반영'),
  ('product-body-pad-sheet-9abd060fc7b9', 'TXA 바디패드', '검색 광고', '검색 의도별 광고 캠페인 분리'),
  ('product-body-pad-sheet-6b091959ba52', 'TXA 바디패드', '상품 타겟 광고', '경쟁 제품 상품 타깃 광고 테스트'),
  ('product-body-pad-sheet-76bf7c13f870', 'TXA 바디패드', '성과 확인', '변경 전후 성과 확인'),
  ('product-dual-cream-sheet-87b13cfa98dd', '듀얼크림', '제품 정보 / 사용법', '성분과 사용법에 맞게 제품 설명 정리'),
  ('product-dual-cream-sheet-ac9ed46f14ee', '듀얼크림', '문구 / SEO', '나이트크림을 찾는 고객에게 제품 특징 전달'),
  ('product-dual-cream-sheet-8ea97e21f10c', '듀얼크림', '이미지 / A+', '두 크림의 역할과 사용 순서를 이미지로 안내'),
  ('product-dual-cream-sheet-3127a45fc3e4', '듀얼크림', '검색 광고', '나이트크림과 넥크림 검색 광고를 나눠 테스트'),
  ('product-dual-cream-sheet-7799a43a8e67', '듀얼크림', '상품 타겟 / 브랜드 광고', '경쟁 제품 광고와 브랜드 검색 광고 분리'),
  ('product-dual-cream-sheet-58d81b092f98', '듀얼크림', '스토어', 'Vita-A 스토어에서 제품 선택을 쉽게 안내'),
  ('product-dual-cream-sheet-4af7dc626df1', '듀얼크림', '성과 확인', '변경 후 성과를 보고 광고비 조정'),
  ('product-sunscreen-sheet-a4609aa3fc55', 'TXA 선크림', '제품 정보 / 표현', '제품 정보와 OTC 표현 확인'),
  ('product-sunscreen-sheet-3283e851e9e8', 'TXA 선크림', '문구 / SEO', 'DataDive 결과를 반영해 Title과 Bullet 수정'),
  ('product-sunscreen-sheet-42a304142396', 'TXA 선크림', '이미지 / A+', '5–1–1 성분과 사용감을 이미지로 안내'),
  ('product-sunscreen-sheet-d5665531d890', 'TXA 선크림', '근거 / PDP', '신뢰 근거 확인 후 PDP에 반영'),
  ('product-sunscreen-sheet-9b5cc47d5ce6', 'TXA 선크림', '검색 광고', '검색 의도별 광고 캠페인 분리'),
  ('product-sunscreen-sheet-f976edd3a492', 'TXA 선크림', '상품 타겟 광고', '경쟁 제품 상품 타겟 광고 테스트'),
  ('product-sunscreen-sheet-ee96640418f1', 'TXA 선크림', '성과 확인', '변경 전후 성과 확인'),
  ('product-eye-patches-sheet-5dc5e0bffec8', '아이패치', '제품 정보 / 사용법', '성분 함량과 사용시간 안내 통일'),
  ('product-eye-patches-sheet-a1a55c6e5620', '아이패치', '문구 / SEO', '눈 밑 패치임을 Title에서 바로 전달'),
  ('product-eye-patches-sheet-3a24a1de4e01', '아이패치', '이미지', '성분 함량과 눈가 고민을 이미지로 연결'),
  ('product-eye-patches-sheet-b7251b42f160', '아이패치', '사용 영상 / A+', '붙이고 떼는 방법을 짧게 보여주기'),
  ('product-eye-patches-sheet-3f22a3f2902a', '아이패치', '검색 광고', '브라이트닝과 카페인 검색어로 광고 테스트'),
  ('product-eye-patches-sheet-d6c60735dd2e', '아이패치', '상품 타겟 / 스토어', '유사 제품 고객과 TXA 라인 고객에게 소개'),
  ('product-eye-patches-sheet-ff56c855cb72', '아이패치', '성과 확인', '클릭과 구매 중 어디에서 이탈하는지 확인'),
  ('product-gel-mask-sheet-c6ba8f9dfb36', '겔마스크', '판매 구성 / 사용법', '판매 구성과 사용 안내 통일'),
  ('product-gel-mask-sheet-6b4a341f8d83', '겔마스크', '문구 / SEO', '얼굴과 목을 함께 관리하는 마스크로 소개'),
  ('product-gel-mask-sheet-b44c84ae2839', '겔마스크', '이미지 / A+', '구성품과 사용 순서를 이미지로 보여주기'),
  ('product-gel-mask-sheet-7e1fa45718a0', '겔마스크', '검색 광고', '제형과 목 관리 검색어로 광고 테스트'),
  ('product-gel-mask-sheet-59fb57a077be', '겔마스크', '상품 타겟 광고', '경쟁 제품을 보고 있는 고객에게 차이 전달'),
  ('product-gel-mask-sheet-9c72bb1f208b', '겔마스크', '스토어 / 브랜드 광고', '기존 레티날 고객에게 겔마스크 소개'),
  ('product-gel-mask-sheet-d52bd34d8601', '겔마스크', '성과 확인', '구매 전환과 사용 관련 반응을 함께 확인'),
  ('store-home', '브랜드스토어', '스토어 디자인', 'Home'),
  ('store-retinal', '브랜드스토어', '스토어 디자인', 'Retinal & Retinol'),
  ('store-txa', '브랜드스토어', '스토어 디자인', 'Tranexamic Acid'),
  ('store-ingredients', '브랜드스토어', '스토어 디자인', 'By Ingredients 진입 화면'),
  ('store-categories', '브랜드스토어', '스토어 디자인', 'By Category 진입 화면'),
  ('store-best-sellers', '브랜드스토어', '스토어 디자인', 'Best Sellers'),
  ('store-bundles', '브랜드스토어', '스토어 디자인', 'Bundle & Gift'),
  ('store-new', '브랜드스토어', '스토어 디자인', 'New'),
  ('store-all', '브랜드스토어', '스토어 디자인', 'All'),
  ('store-other-ingredients', '브랜드스토어', '스토어 디자인', '기타 성분별 페이지'),
  ('store-product-types', '브랜드스토어', '스토어 디자인', '제품 유형별 하위 페이지'),
  ('store-toners', '브랜드스토어', '스토어 디자인', 'Toners & Essences'),
  ('store-design-standards', '브랜드스토어', '스토어 디자인', '공통 디자인 기준'),
  ('common-evidence', '공통', '근거 확인', '제품별 자료와 표현 대조'),
  ('common-consistency', '공통', '최종 검수', '페이지별 제품 정보와 링크 확인'),
  ('common-baseline', '공통', '성과 비교', '수정 전후 비교 기준 정리')
ON CONFLICT (task_id) DO NOTHING;

ALTER TABLE public.celimax_action_items ENABLE ROW LEVEL SECURITY;

-- Grants are restricted to this one table. RLS stays enabled.
REVOKE ALL ON TABLE public.celimax_action_items FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (task_id, product_name, area, action_title, assignee, planned_date, is_done, result, revision, updated_at)
  ON TABLE public.celimax_action_items FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON TABLE public.celimax_action_items TO anon;
GRANT UPDATE (assignee, planned_date, is_done, result)
  ON TABLE public.celimax_action_items TO anon;

DROP POLICY IF EXISTS celimax_action_items_anon_read ON public.celimax_action_items;
CREATE POLICY celimax_action_items_anon_read
  ON public.celimax_action_items FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS celimax_action_items_anon_update ON public.celimax_action_items;
CREATE POLICY celimax_action_items_anon_update
  ON public.celimax_action_items FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- No INSERT or DELETE permission is granted to website visitors.
NOTIFY pgrst, 'reload schema';
COMMIT;

SELECT count(*) AS action_item_count FROM public.celimax_action_items;
