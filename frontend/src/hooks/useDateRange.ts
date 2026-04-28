'use client';

import { useSearchParams } from 'next/navigation';

/**
 * URL 쿼리 파라미터(startDate, endDate, compare)를 읽어 차트들이 공유하는
 * "기간 상태"를 반환한다. 진실 원천 = URL.
 *
 * 기본값: 최근 7일 (오늘 포함). 모든 차트가 같은 훅을 사용해야 일관됨.
 */

const TODAY_OFFSET_DAYS = 6; // 7일 = 오늘 포함 7일 = -6일 ~ 오늘

/** "YYYY-MM-DD" KST 기준 오늘 (UTC 시각에 +9 → ISO date 잘라내기) */
export function todayKst(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** UTC 자정 기준 Date로 일 단위 산술 → TZ 함정 없음 */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface DateRange {
  startDate: string;
  endDate: string;
  compareWithPrevious: boolean;
}

export function useDateRange(): DateRange {
  const searchParams = useSearchParams();
  const today = todayKst();

  const startDate = searchParams.get('startDate') ?? addDays(today, -TODAY_OFFSET_DAYS);
  const endDate   = searchParams.get('endDate')   ?? today;
  const compareWithPrevious = searchParams.get('compare') === 'true';

  return { startDate, endDate, compareWithPrevious };
}
