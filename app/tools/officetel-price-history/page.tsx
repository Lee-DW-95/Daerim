import { redirect } from "next/navigation";

/**
 * 오피스텔 전월세 페이지는 통합 시세 추이 페이지로 흡수되었습니다.
 * 기존 외부 링크·즐겨찾기를 위해 영구 리다이렉트.
 */
export default function OfficetelPriceHistoryRedirect() {
  redirect("/tools/price-history");
}
