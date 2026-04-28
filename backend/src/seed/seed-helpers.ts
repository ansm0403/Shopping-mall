/** 정수 난수 [min, max] 범위 */
export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * N일 전의 KST 기준 무작위 시각을 UTC Date로 반환.
 *
 * 왜 KST로 계산하는가:
 * - 대시보드 쿼리가 AT TIME ZONE 'Asia/Seoul' 로 GROUP BY하기 때문에
 *   UTC로 시각을 만들면 일별 분포가 KST 자정과 어긋남.
 * - 반드시 KST 기준 특정 날짜에 데이터가 속하도록 생성해야 차트가 올바른 날짜에 점을 찍음.
 */
export function randomKstTime(daysAgo: number, hourMin = 9, hourMax = 23): Date {
  const hour = rand(hourMin, hourMax);
  const minute = rand(0, 59);
  const second = rand(0, 59);

  // 오늘 KST 날짜 문자열 추출
  const kstNow = new Date(Date.now() + 9 * 3_600_000);
  const kstToday = kstNow.toISOString().slice(0, 10);

  // N일 전 날짜 계산
  const base = new Date(`${kstToday}T00:00:00+09:00`);
  base.setDate(base.getDate() - daysAgo);
  const dateStr = base.toISOString().slice(0, 10);

  // KST 시각 문자열 → new Date()가 UTC로 자동 변환
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  const s = String(second).padStart(2, '0');
  return new Date(`${dateStr}T${h}:${m}:${s}+09:00`);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
