[Nest] 29388  - 2026. 04. 28. 오전 3:14:14   ERROR [ExceptionsHandler] QueryFailedError: column "created_at" does not exist
    at PostgresQueryRunner.query (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\driver\postgres\PostgresQueryRunner.js:216:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async DataSource.query (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\data-source\DataSource.js:353:20)
    at async DashboardService.getKpi (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\dist\main.js:11508:23) {
  query: "\n      SELECT\n        -- 1. 오늘 주문 수 (created_at 기준)\n        (SELECT COUNT(*)::text FROM orders\n          WHERE created_at >= $1 AND created_at < $2)\n          AS today_orders,\n        -- 2. 어제 동시간까지 주문 수 (delta% 계산용)\n        (SELECT COUNT(*)::text FROM orders\n          WHERE created_at >= $3 AND created_at < $4)\n          AS yday_orders,\n        -- 3. 오늘 매출 (paid_at 기준 — 결제 완료된 주문만)\n        (SELECT COALESCE(SUM(total_amount), 0)::text FROM orders\n          WHERE paid_at IS NOT NULL AND paid_at >= $1 AND paid_at < $2)\n          AS today_revenue,\n        -- 4. 어제 동시간까지 매출\n        (SELECT COALESCE(SUM(total_amount), 0)::text FROM orders\n          WHERE paid_at IS NOT NULL AND paid_at >= $3 AND paid_at < $4)\n          AS yday_revenue,\n        -- 5. 미처리 배송 (현재 시점 status='paid')\n        (SELECT COUNT(*)::text FROM orders WHERE status = $5)\n          AS pending_shipments,\n        -- 6-1. 오늘 로그인 실패 건수\n        (SELECT COUNT(*)::text FROM audit_logs\n          WHERE action = $6 AND created_at >= $1 AND created_at < $2)\n          AS today_failed_login,\n        -- 6-2. 오늘 LOGIN(성공) + FAILED_LOGIN 합 (실패율 분모)\n        (SELECT COUNT(*)::text FROM audit_logs\n          WHERE action IN ($7, $6) AND created_at >= $1 AND created_at < $2)\n          AS today_total_login_attempts\n      ",
  parameters: [
    2026-04-27T15:00:00.000Z,
    2026-04-27T18:14:14.229Z,
    2026-04-26T15:00:00.000Z,
    2026-04-26T18:14:14.229Z,
    'paid',
    'FAILED_LOGIN',
    'LOGIN'
  ],
  driverError: error: column "created_at" does not exist
      at C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\pg\lib\client.js:631:17
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async PostgresQueryRunner.query (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\driver\postgres\PostgresQueryRunner.js:181:25)
      at async DataSource.query (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\data-source\DataSource.js:353:20)
      at async DashboardService.getKpi (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\dist\main.js:11508:23) {
    length: 174,
    severity: 'ERROR',
    code: '42703',
    detail: undefined,
    hint: 'Perhaps you meant to reference the column "orders.createdAt".',
    position: '112',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '3829',
    routine: 'errorMissingColumn'
  },
  length: 174,
  severity: 'ERROR',
  code: '42703',
  detail: undefined,
  hint: 'Perhaps you meant to reference the column "orders.createdAt".',
  position: '112',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '3829',
  routine: 'errorMissingColumn'
}