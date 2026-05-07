/**
 * 한국 부동산 표시용 포매터.
 */

const MAN_PER_EOK = 10_000;

/** 만원(만원 단위 정수) → "9억 2,500" / "9.25억" 같은 표시. */
export function formatManwon(
  value: number,
  options: { unit?: "auto" | "manwon" | "eok"; decimals?: number } = {}
): string {
  const { unit = "auto", decimals = 2 } = options;
  if (!Number.isFinite(value) || value === 0) return "—";

  if (unit === "manwon" || (unit === "auto" && value < MAN_PER_EOK)) {
    return `${value.toLocaleString("ko-KR")}만원`;
  }

  const eok = value / MAN_PER_EOK;
  const display = eok.toFixed(decimals).replace(/\.?0+$/, "");
  return `${display}억`;
}

/** 평형 → "39평". */
export function formatPyeong(p: number): string {
  return `${p}평`;
}

/** YYYY-MM → "2024.04". */
export function formatYearMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}.${m}`;
}

/** 거래 건수 → "12건". */
export function formatCount(n: number): string {
  return `${n.toLocaleString("ko-KR")}건`;
}
