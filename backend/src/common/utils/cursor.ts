import { BadRequestException } from '@nestjs/common';

/**
 * 커서 페이로드: 정렬 키 값 + id의 조합.
 * 다음 페이지 조건식 `(sortBy OP sortValue) OR (sortBy = sortValue AND id OP id)` 에 그대로 대입된다.
 */
export interface CursorPayload {
  sortValue: unknown;
  id: number;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeCursor(cursor: string): CursorPayload {
  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch {
    throw new BadRequestException('유효하지 않은 커서 형식입니다.');
  }

  // EC-A: JSON이 객체가 아닌 경우(null, primitive, 배열) 방어 — 이후 프로퍼티 접근이 TypeError로 500이 되는 것을 막는다.
  if (decoded === null || typeof decoded !== 'object' || Array.isArray(decoded)) {
    throw new BadRequestException('유효하지 않은 커서 형식입니다.');
  }

  const { sortValue, id } = decoded as Partial<CursorPayload>;

  if (sortValue === undefined || id === undefined) {
    throw new BadRequestException('커서에 필수 값(sortValue, id)이 없습니다.');
  }

  // EC-B: nullable 정렬 컬럼(예: rating)에서 마지막 아이템의 값이 null이면 encoder가 sortValue=null로 인코딩하고,
  //       그대로 `col < NULL` 로 바인딩되면 SQL 결과가 항상 NULL(=false)이 되어 빈 결과를 반환하고 hasNext가 거짓말이 된다.
  //       조용히 깨지게 두는 대신 문제의 지점에서 400으로 즉시 드러낸다.
  if (sortValue === null) {
    throw new BadRequestException(
      '커서의 정렬 값이 null입니다. 정렬 컬럼에 null 값이 포함된 경우 커서 기반 페이지네이션을 지원하지 않습니다. sortBy를 id나 createdAt 같은 non-null 컬럼으로 변경해주세요.',
    );
  }

  return { sortValue, id };
}
