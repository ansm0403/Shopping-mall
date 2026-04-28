/**
 * KST(Asia/Seoul, UTC+9) 시간대 변환 유틸.
 * 모든 대시보드 집계는 KST 기준 자정~자정 [start, end+1) 반열림 구간을 쓴다.
 */

/**
 * "YYYY-MM-DD" 두 개를 받아 KST 자정 기준 [start, endNext) UTC Date 두 개로 변환.
 * endDate 자정 + 1일 = 다음날 자정 → 반열림 구간으로 endDate 하루 전체 포함.
 */
export function toKstRange(startDate: string, endDate: string): [Date, Date] {
  const start   = new Date(`${startDate}T00:00:00+09:00`);
  const endNext = new Date(`${endDate}T00:00:00+09:00`);
  endNext.setDate(endNext.getDate() + 1);
  return [start, endNext];
}

/**
 * KST 기준 "오늘 자정 ~ 현재", "어제 자정 ~ 어제 동시각" 두 구간을 반환.
 * KPI 카드의 "전일 동시간 대비" 계산에 사용.
 */
export function getTodayAndYesterdaySoFar(now: Date = new Date()): {
  todayStart: Date;
  todayNow:   Date;
  ydayStart:  Date;
  ydayUntilNow: Date;
} {
  // KST로 환산하기 위해 + 9시간
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = kstNow.getUTCFullYear();
  const m = kstNow.getUTCMonth();
  const d = kstNow.getUTCDate();

  // KST 자정 (UTC로 다시 변환할 때는 -9시간)
  const todayStart  = new Date(Date.UTC(y, m, d, 0, 0, 0) - 9 * 60 * 60 * 1000);
  const ydayStart   = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const ydayUntilNow = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return { todayStart, todayNow: now, ydayStart, ydayUntilNow };
}

/**
 * 두 값의 증감률(%) — 직전 값이 0이면 (현재 0이면 0, 아니면 100) 반환.
 * KPI 카드의 deltaPercent 계산.
 */
export function calcDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10; // 소수 1자리
}

/**
 * 기간 검증 — startDate ≤ endDate, 최대 90일.
 * 위반 시 BadRequestException용 에러 메시지를 throw 대신 string | null 반환 (서비스에서 throw).
 */
export function validateDateRange(startDate: string, endDate: string): string | null {
  const [start, endNext] = toKstRange(startDate, endDate);
  if (start.getTime() >= endNext.getTime()) {
    return 'startDate는 endDate 이전이거나 같아야 합니다.';
  }
  const diffDays = (endNext.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
  if (diffDays > 91) {
    return '조회 기간은 최대 90일까지입니다.';
  }
  return null;
}

/**
 * "YYYY-MM-DD" 문자열에 N일을 더한 새 문자열 반환 (음수 가능).
 * 내부적으로 UTC 자정 기준 Date를 쓰므로 DST/TZ 영향 없음.
 * 시:분:초 정보가 필요 없는 "달력 날짜" 연산 전용.
 */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * 두 날짜의 "포함 일 수" — startDate=2026-04-01, endDate=2026-04-07 → 7.
 * compareWithPrevious용 직전 기간 길이 계산에 사용.
 */
export function daysBetweenInclusive(startDate: string, endDate: string): number {
  const ds = new Date(`${startDate}T00:00:00Z`);
  const de = new Date(`${endDate}T00:00:00Z`);
  return Math.round((de.getTime() - ds.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * "직전 동일 길이 기간" 계산.
 * (4/1 ~ 4/7, 7일) → (3/25 ~ 3/31)
 * 끝 = 시작 - 1일, 시작 = 시작 - 길이.
 */
export function getPreviousPeriod(startDate: string, endDate: string): {
  startDate: string;
  endDate: string;
} {
  const days = daysBetweenInclusive(startDate, endDate);
  return {
    startDate: addDays(startDate, -days),
    endDate:   addDays(startDate, -1),
  };
}

/**
 * SQL은 데이터가 있는 날짜만 반환한다. 차트 x축에 빈 날짜를 0으로 채운 배열로 변환.
 * - rows: SQL 결과 (date 필드가 'YYYY-MM-DD')
 * - startDate/endDate: KST 기준 포함 구간
 * - defaults: 빈 날짜에 채울 나머지 필드 (예: { ordered: 0, paid: 0, cancelled: 0 })
 */
export function fillEmptyDates<T extends { date: string }>(
  rows: T[],
  startDate: string,
  endDate: string,
  defaults: Omit<T, 'date'>,
): T[] {
  const map = new Map(rows.map((r) => [r.date, r]));
  const out: T[] = [];
  let cursor = startDate;
  // YYYY-MM-DD는 사전순(lexicographic) 비교가 곧 시간순이라 안전하게 string 비교 가능.
  while (cursor <= endDate) {
    out.push(map.get(cursor) ?? ({ date: cursor, ...defaults } as T));
    cursor = addDays(cursor, 1);
  }
  return out;
}
