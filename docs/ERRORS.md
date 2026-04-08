[Nest] 44324  - 2026. 04. 08. 오후 11:46:10   ERROR [ExceptionsHandler] QueryFailedError: FOR UPDATE cannot be applied to the nullable side of an outer join        
    at PostgresQueryRunner.query (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\driver\postgres\PostgresQueryRunner.js:216:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) 
    at async SelectQueryBuilder.loadRawResults (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:2231:25)    
    at async SelectQueryBuilder.executeEntitiesAndRawResults (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:2079:26)
    at async SelectQueryBuilder.getRawAndEntities (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:684:29)  
    at async SelectQueryBuilder.getMany (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:750:25)
    at async C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\dist\main.js:8716:31
    at async EntityManager.transaction (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\entity-manager\EntityManager.js:75:28)
    at async OrderService.createOrder (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\dist\main.js:8713:27) {
  query: 'SELECT "ci"."id" AS "ci_id", "ci"."createdAt" AS "ci_createdAt", "ci"."updatedAt" AS "ci_updatedAt", "ci"."cart_id" AS "ci_cart_id", "ci"."product_id" AS "ci_product_id", "ci"."quantity" AS "ci_quantity", "product"."id" AS "product_id", "product"."createdAt" AS "product_createdAt", "product"."updatedAt" AS "product_updatedAt", "product"."name" AS "product_name", "product"."description" AS "product_description", "product"."price" AS "product_price", "product"."brand" AS "product_brand", "product"."stockQuantity" AS "product_stockQuantity", "product"."status" AS "product_status", "product"."approval_status" AS "product_approval_status", "product"."sales_type" AS "product_sales_type", "product"."rejection_reason" AS "product_rejection_reason", "product"."approved_at" AS "product_approved_at", "product"."salesCount" AS "product_salesCount", "product"."viewCount" AS "product_viewCount", "product"."isEvent" AS "product_isEvent", "product"."discountRate" AS "product_discountRate", "product"."rating" AS "product_rating", "product"."specs" AS "product_specs", "product"."seller_id" AS "product_seller_id", "product"."category_id" AS "product_category_id", "product"."reviewCount" AS "product_reviewCount", "product"."ratingSum" AS "product_ratingSum", "product"."wishCount" AS "product_wishCount", "images"."id" AS "images_id", "images"."createdAt" AS "images_createdAt", "images"."updatedAt" AS "images_updatedAt", "images"."url" AS "images_url", "images"."isPrimary" AS "images_isPrimary", "images"."sortOrder" AS "images_sortOrder", "images"."productId" AS "images_productId" FROM "cart_items" "ci" LEFT JOIN "products" "product" ON "product"."id"="ci"."product_id"  LEFT JOIN "product_images" "images" ON "images"."productId"="product"."id" WHERE "ci"."id" IN ($1, $2) AND "ci"."cart_id" = $3 FOR UPDATE',
  parameters: [
    4,
    3,
    1
  ],
  driverError: error: FOR UPDATE cannot be applied to the nullable side of an outer join
      at C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\pg\lib\client.js:631:17
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async PostgresQueryRunner.query (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\driver\postgres\PostgresQueryRunner.js:181:25)        
      at async SelectQueryBuilder.loadRawResults (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:2231:25)  
      at async SelectQueryBuilder.executeEntitiesAndRawResults (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:2079:26)
      at async SelectQueryBuilder.getRawAndEntities (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:684:29)
      at async SelectQueryBuilder.getMany (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\query-builder\SelectQueryBuilder.js:750:25)
      at async C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\dist\main.js:8716:31
      at async EntityManager.transaction (C:\Users\kiria\Desktop\fullstack\shopping_mall\node_modules\typeorm\entity-manager\EntityManager.js:75:28)
      at async OrderService.createOrder (C:\Users\kiria\Desktop\fullstack\shopping_mall\backend\dist\main.js:8713:27) {
    length: 133,
    severity: 'ERROR',
    code: '0A000',
    detail: undefined,
    hint: undefined,
    position: undefined,
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'initsplan.c',
    dataType: undefined,
    constraint: undefined,
    file: 'initsplan.c',
    line: '1751',
    routine: 'make_outerjoininfo'
  },
    constraint: undefined,
    file: 'initsplan.c',
    line: '1751',
    routine: 'make_outerjoininfo'
  },
  length: 133,
  severity: 'ERROR',
    line: '1751',
    routine: 'make_outerjoininfo'
  },
  length: 133,
  severity: 'ERROR',
  code: '0A000',
  detail: undefined,
  length: 133,
  severity: 'ERROR',
  code: '0A000',
  detail: undefined,
  code: '0A000',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  position: undefined,
  internalPosition: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'initsplan.c',
  line: '1751',
  routine: 'make_outerjoininfo'
}