/**
 * 카테고리 slug → 아이콘 이모지 매핑
 * slug의 첫 번째 세그먼트(루트 카테고리)를 기준으로 매핑합니다.
 * 예: 'clothing-spring' → 'clothing' → '👗'
 */
const ROOT_ICON_MAP: Record<string, string> = {
  clothing: '👗',
  beauty:   '💄',
  shoes:    '👟',
  book:     '📚',
  food:     '🍱',
  living:   '🏠',
};

const DEFAULT_ICON = '🛍️';

/** slug로부터 아이콘 이모지를 반환합니다. */
export function getCategoryIcon(slug: string): string {
  const root = slug.split('-')[0];
  return ROOT_ICON_MAP[root] ?? DEFAULT_ICON;
}
