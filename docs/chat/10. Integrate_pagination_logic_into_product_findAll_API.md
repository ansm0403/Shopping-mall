# Product API 페이지네이션 통합 - 작업 기록

## 요청 사항

### 초기 질문
- `findAll` API가 `CommonService.paginate` 로직과 연동될 수 있는지 확인
- 현재 페이지네이션 로직의 동작 방식 설명
- 현업 패턴과의 유사성 분석
- 수정이 필요하면 계획 수립

### 추가 지시사항
1. **DTO 선택**: `ProductQueryDto`가 `BasePaginateDto`를 **상속** (Option A 선택)
   - 이유: 현업 패턴(Prisma, MikroORM 기반 SaaS)과 유사, 확장성 우수
2. **가드 처리**: `PaginateQueryGuard` **삭제** (데드코드 확인)
3. **엣지 케이스**: 중요 로직 3-4가지 예외 처리 보강

---

## 현재 페이지네이션 동작 방식 (작업 전)

### 두 모드 지원
**1. 페이지 기반** (`page` 쿼리 있을 때)
```
offset 방식: skip((page-1)*take) + take
응답: { data, meta: { total, page, lastPage, hasNextPage, hasPreviousPage } }
```

**2. 커서 기반** (`page` 없으면 자동 활성화 - 무한 스크롤)
```
마지막 아이템 { sortValue, id } → base64 인코딩
응답: { data, meta: { count, hasNext, nextCursor }, next: 다음URL }
```

### 발견된 4가지 문제점

1. **분리된 두 시스템**
   - `CommonService.paginate`: `BasePaginateDto` + `filter[field][op]` 중첩 객체
   - `ProductService.findAll`: `ProductQueryDto` + `categoryId`, `status` 직접 파라미터
   - → `findAll`에서 커서 기반 페이지네이션 미지원

2. **SerializeInterceptor `next` 필드 누락**
   - `{ data, meta }` 만 통과 → cursor 응답의 `next` URL 손실

3. **PaginateQueryGuard 데드코드**
   - `where__field__filterType` 옛날 형식만 검증
   - 현재 DTO는 `filter[field][op]` 중첩 형식 사용
   - 어느 라우트에도 미적용

4. **filter-mapper.const.ts 미연결**
   - 옛날 `where__field__op` 방식용 TypeORM 함수 매핑
   - 현재 로직과 무관

---

## 실행한 수정 사항

### 1단계: CommonService 버그 수정

#### pagePaginate - where 병합 버그 수정
```typescript
// 변경 전: overrideFindOptions.where가 DTO filter where를 덮어씀
// 변경 후: 두 조건을 병합
const overrideWhere = overrideFindOptions.where ?? {};
const { where: _, ...restOverride } = overrideFindOptions;

const [data, total] = await repository.findAndCount({
  where: { ...where, ...(overrideWhere as object) },
  // ...
});
```

**이유**: `findAll`에서 고정 조건(approvalStatus=APPROVED)을 overrideFindOptions.where로 전달할 때, DTO filter와 함께 적용되어야 함

#### cursorPaginate - overrideFindOptions.where QB 적용 추가
```typescript
// 추가된 로직: 원시값 조건(enum/string/number)을 QueryBuilder에 andWhere로 추가
if (overrideFindOptions.where && typeof overrideFindOptions.where === 'object' && !Array.isArray(overrideFindOptions.where)) {
  Object.entries(overrideFindOptions.where).forEach(([key, value]) => {
    if (value !== undefined && value !== null && typeof value !== 'object') {
      qb.andWhere(`entity.${key} = :__fixed_${key}`, { [`__fixed_${key}`]: value });
    }
  });
}
```

**이유**: 커서 기반에서도 고정 조건(예: status='PUBLISHED')이 적용되어야 함

---

### 2단계: DTO 통합

#### ProductQueryDto extends BasePaginateDto
```typescript
// 변경 전
export class ProductQueryDto {
  @IsOptional() page?: number = 1;
  @IsOptional() take?: number = 20;
  @IsOptional() categoryId?: number;
  // ...
}

// 변경 후
export class ProductQueryDto extends BasePaginateDto {
  @IsOptional() categoryId?: number;
  @IsOptional() status?: ProductStatus;
  @IsOptional() approvalStatus?: ApprovalStatus;
  @IsOptional() sellerId?: number;
}
```

**이유**: 
- 범용 페이지네이션 로직(page, take, sortBy, sortOrder, cursor, filter) 자동 상속
- page/cursor 모드 자동 분기 지원
- 코드 중복 제거

---

### 3단계: ProductService 재작성

#### CommonService 주입
```typescript
constructor(
  // ... 기존
  private readonly commonService: CommonService,
) {}
```

#### findAll 재작성
```typescript
// 변경 전: 50줄의 수동 QueryBuilder
async findAll(query: ProductQueryDto) {
  const { page = 1, take = 20, categoryId, status, sellerId } = query;
  const cacheKey = `products:list:${page}:${take}:${categoryId}...`;
  const cached = await this.redisService.getCache(cacheKey);
  if (cached) return cached;
  
  const qb = this.productRepository.createQueryBuilder('product')
    // ... 7-8줄의 조건 추가
  const [data, total] = await qb.getManyAndCount();
  // ... 계산 및 캐싱
}

// 변경 후: 15줄로 단순화
async findAll(query: ProductQueryDto) {
  const cacheKey = `products:list:${JSON.stringify(query)}`;
  const cached = await this.redisService.getCache<{ data: unknown[]; meta: unknown }>(cacheKey);
  // 캐시 corrupt 방어
  if (cached) {
    if (Array.isArray(cached.data) && cached.meta && typeof cached.meta === 'object') {
      return cached;
    }
    await this.redisService.delCache(cacheKey);
  }

  const fixedWhere: FindOptionsWhere<ProductEntity> = {
    approvalStatus: ApprovalStatus.APPROVED,
    status: ProductStatus.PUBLISHED,
  };
  if (query.categoryId) fixedWhere.categoryId = query.categoryId;
  if (query.sellerId) fixedWhere.sellerId = query.sellerId;

  const result = await this.commonService.paginate(
    query,
    this.productRepository,
    'products',
    { where: fixedWhere, relations: ['images', 'category', 'seller'] },
  );

  await this.redisService.setCache(cacheKey, result, ProductService.CACHE_TTL_LIST);
  return result;
}
```

**이점**:
- 페이지 기반 + 커서 기반(무한 스크롤) 자동 지원
- relations 자동 적용
- 소스 코드 길이 50→15줄 (70% 감소)
- 유지보수성 증가

#### findMyProducts & findAllAdmin 동일하게 재작성
```typescript
async findMyProducts(userId: number, query: ProductQueryDto) {
  const seller = await this.getApprovedSeller(userId);
  const fixedWhere: FindOptionsWhere<ProductEntity> = { sellerId: seller.id };
  if (query.categoryId) fixedWhere.categoryId = query.categoryId;
  if (query.status) fixedWhere.status = query.status;
  if (query.approvalStatus) fixedWhere.approvalStatus = query.approvalStatus;

  return this.commonService.paginate(
    query,
    this.productRepository,
    'products/my',
    { where: fixedWhere, relations: ['images', 'category'] },
  );
}

async findAllAdmin(query: ProductQueryDto) {
  const fixedWhere: FindOptionsWhere<ProductEntity> = {};
  if (query.categoryId) fixedWhere.categoryId = query.categoryId;
  if (query.status) fixedWhere.status = query.status;
  if (query.approvalStatus) fixedWhere.approvalStatus = query.approvalStatus;
  if (query.sellerId) fixedWhere.sellerId = query.sellerId;

  return this.commonService.paginate(
    query,
    this.productRepository,
    'admin/products',
    { where: fixedWhere, relations: ['images', 'category', 'seller'] },
  );
}
```

---

### 4단계: SerializeInterceptor 수정

#### next 필드 pass-through 추가
```typescript
// 변경 전
intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle().pipe(
    map((data) => {
      if (data && data.data && data.meta) {
        return {
          data: this.transform(data.data),
          meta: data.meta,
        };
      }
      return this.transform(data);
    }),
  );
}

// 변경 후
intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle().pipe(
    map((data) => {
      if (data && data.data && data.meta) {
        const result: Record<string, unknown> = {
          data: this.transform(data.data),
          meta: data.meta,
        };
        if (data.next !== undefined) result.next = data.next;
        return result;
      }
      return this.transform(data);
    }),
  );
}
```

**이유**: cursor 응답의 `next` URL 필드가 JSON 직렬화 시 제거되던 버그 해결

---

### 5단계: 데드코드 삭제

삭제된 파일:
- `backend/src/common/guards/paginate-query.guard.ts` — 옛날 `where__field__op` 형식만 검증, 미적용
- `backend/src/common/dto/validators/paginate-query.validator.ts` — 동일 역할, 어디서도 import되지 않음
- `backend/src/common/const/filter-mapper.const.ts` — 위 두 파일에서만 사용, 현 로직과 무관

---

### 6단계: 엣지 케이스 예외 처리 강화

#### CommonService.paginate 진입 시 4가지 검증 추가

```typescript
private static readonly MAX_TAKE = 100;
private static readonly SORTABLE_COLUMNS: SortableKey[] = ['id', 'createdAt', 'rating', 'price', 'viewCount'];

async paginate<T extends BaseModel>(
  dto: BasePaginateDto,
  repository: Repository<T>,
  path: string,
  overrideFindOptions: FindManyOptions<T> = {}
) {
  // 1. page와 cursor 동시 사용 방어
  if (dto.page && dto.cursor) {
    throw new BadRequestException('page와 cursor는 동시에 사용할 수 없습니다.');
  }

  // 2. take 상한 제한 (DB 과부하 방어)
  if (dto.take > CommonService.MAX_TAKE) {
    throw new BadRequestException(`take는 최대 ${CommonService.MAX_TAKE}까지 허용됩니다.`);
  }

  const sortBy = (dto.sortBy ?? 'createdAt') as SortKey<T>;
  const sortOrder = dto.sortOrder || 'DESC';

  // 3. sortBy 컬럼 검증 (잘못된 컬럼명 차단)
  if (dto.sortBy && !CommonService.SORTABLE_COLUMNS.includes(dto.sortBy as SortableKey)) {
    throw new BadRequestException(
      `sortBy는 ${CommonService.SORTABLE_COLUMNS.join(', ')} 중 하나여야 합니다.`,
    );
  }
  // ...
}
```

**케이스 1: page + cursor 동시 사용**
- **원인**: page가 있으면 cursor가 무시되어 클라이언트 착각
- **해결**: 명시적 `BadRequestException` 반환

**케이스 2: take 상한 초과**
- **원인**: `take=100000` 같은 악의적/실수 요청으로 DB OOM 유발
- **해결**: 최대값 100 제한

**케이스 3: 허용되지 않는 sortBy 컬럼**
- **원인**: `sortBy=unknownColumn` 요청 시 DB 에러 또는 N+1 쿼리
- **해결**: 화이트리스트 검증

#### applyCursorCondition에서 디코딩 실패 처리

```typescript
private applyCursorCondition<T extends BaseModel>(...) {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, 'base64').toString('utf-8')
    );
    const { sortValue, id } = decoded;

    // 4. 커서 필수값 검증
    if (sortValue === undefined || id === undefined) {
      throw new BadRequestException('커서에 필수 값(sortValue, id)이 없습니다.');
    }
    // ...
  } catch (error) {
    throw new BadRequestException('Invalid cursor format');
  }
}
```

**케이스 4: 커서 디코딩 시 필수값 누락**
- **원인**: corrupt 커서로 `sortValue` 또는 `id`가 없으면 `WHERE entity.xxx < undefined` 쿼리 실행
- **결과**: 전체 데이터 오반환 또는 예측 불가능한 결과
- **해결**: 명시적 검증

#### ProductService.findAll에서 Redis 캐시 corrupt 방어

```typescript
async findAll(query: ProductQueryDto) {
  const cacheKey = `products:list:${JSON.stringify(query)}`;
  const cached = await this.redisService.getCache<{ data: unknown[]; meta: unknown }>(cacheKey);
  
  // 5. 캐시 구조 검증
  if (cached) {
    if (Array.isArray(cached.data) && cached.meta && typeof cached.meta === 'object') {
      return cached;
    }
    // corrupt되었으면 무효화 후 DB 재조회
    await this.redisService.delCache(cacheKey);
  }
  // ...
}
```

**케이스 5: Redis 캐시 corrupt**
- **원인**: Redis 메모리 손상, 직렬화 오류 등으로 캐시 구조 변형
- **해결**: 타입 검증 후 유효하지 않으면 캐시 삭제 및 DB 재조회

---

## 최종 결과

### 코드 개선
| 항목 | 변경 |
|---|---|
| 소스 라인 수 | -50줄 (ProductService 조회 메서드) |
| 메서드 복잡도 | 수동 QB 제거 → 선언적 호출 |
| 지원 페이지네이션 | 페이지 기반만 → 페이지+커서 기반 |
| 데드코드 | 3개 파일 삭제 |

### 기능 확대
- `findAll` **무한 스크롤** 지원: `?page` 없이 `?cursor=...&sortBy=createdAt` 요청 가능
- `findMyProducts`, `findAllAdmin` 동일

### 테스트 시나리오
```bash
# 페이지 기반
GET /products?page=1&take=20&filter[category][equals]=BEAUTY

# 커서 기반 (첫 요청)
GET /products?take=20&sortBy=createdAt&sortOrder=DESC

# 커서 기반 (다음 페이지)
GET /products?take=20&sortBy=createdAt&sortOrder=DESC&cursor=eyJzb3J0VmFsdWU...
```

---

## 다음 Review API 페이지네이션 인계 사항

새로운 Context에서 Review API 페이지네이션 작업 시:

### 1. 필요 파일
- 수정된 `common.service.ts` — `paginate()` 로직 유지
- `common.dto.ts` (BasePaginateDto) — DTO 상속용
- `serialize.interceptor.ts` — next 필드 처리 이미 적용

### 2. 할 일
- ReviewQueryDto extends BasePaginateDto
- Review Service 조회 메서드 → `commonService.paginate()` 호출로 변경
- 필요시 Redis 캐싱 추가 (권장)

### 3. 주의사항
- `overrideFindOptions.where`에서 고정 조건(userId, status 등) 전달
- relations 포함 (leftJoinAndSelect 자동화)
- 예외 처리는 이미 CommonService에 구현됨 → 별도 추가 불필요

---

## 참고 자료

- **현업 패턴 참고**: Prisma pagination, MikroORM query DSL
- **커서 기반 무한 스크롤**: Keyset/seek pagination (하위 호환성 우수)
- **페이지 기반 한계**: 데이터 삽입/삭제 시 건너뛰는 행 발생 가능 → 커서로 보완
