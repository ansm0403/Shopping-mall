# Diff Details

Date : 2026-04-09 04:31:30

Directory c:\\Users\\kiria\\Desktop\\fullstack\\shopping_mall

Total : 220 files,  33875 codes, 443 comments, 1316 blanks, all 35634 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.yarnrc.yml](/.yarnrc.yml) | YAML | 1 | 0 | 0 | 1 |
| [CSP\_SECURITY\_GUIDE.md](/CSP_SECURITY_GUIDE.md) | Markdown | -177 | -1 | -48 | -226 |
| [README.md](/README.md) | Markdown | 194 | 0 | 53 | 247 |
| [SECURITY\_RECOMMENDATIONS.md](/SECURITY_RECOMMENDATIONS.md) | Markdown | -503 | 0 | -103 | -606 |
| [backend/package.json](/backend/package.json) | JSON | 7 | 0 | 0 | 7 |
| [backend/src/app/app.module.ts](/backend/src/app/app.module.ts) | TypeScript | 4 | 0 | 0 | 4 |
| [backend/src/audit/audit.controller.ts](/backend/src/audit/audit.controller.ts) | TypeScript | 14 | 0 | 1 | 15 |
| [backend/src/audit/audit.module.ts](/backend/src/audit/audit.module.ts) | TypeScript | 16 | 0 | -1 | 15 |
| [backend/src/audit/audit.service.ts](/backend/src/audit/audit.service.ts) | TypeScript | 28 | 0 | 6 | 34 |
| [backend/src/audit/decorators/auditable.decorator.ts](/backend/src/audit/decorators/auditable.decorator.ts) | TypeScript | 13 | 9 | 5 | 27 |
| [backend/src/audit/dto/audit-log-query.dto.ts](/backend/src/audit/dto/audit-log-query.dto.ts) | TypeScript | 35 | 0 | 9 | 44 |
| [backend/src/audit/dto/audit-log-response.dto.ts](/backend/src/audit/dto/audit-log-response.dto.ts) | TypeScript | 21 | 0 | 10 | 31 |
| [backend/src/audit/entity/audit-log.entity.ts](/backend/src/audit/entity/audit-log.entity.ts) | TypeScript | 26 | 11 | 10 | 47 |
| [backend/src/audit/interceptors/audit.interceptor.ts](/backend/src/audit/interceptors/audit.interceptor.ts) | TypeScript | 86 | 8 | 12 | 106 |
| [backend/src/auth/auth.controller.ts](/backend/src/auth/auth.controller.ts) | TypeScript | 1 | 1 | 1 | 3 |
| [backend/src/auth/auth.service.ts](/backend/src/auth/auth.service.ts) | TypeScript | 0 | -1 | 0 | -1 |
| [backend/src/category/category.module.ts](/backend/src/category/category.module.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [backend/src/category/category.service.spec.ts](/backend/src/category/category.service.spec.ts) | TypeScript | 27 | 4 | 4 | 35 |
| [backend/src/category/category.service.ts](/backend/src/category/category.service.ts) | TypeScript | 10 | 3 | 2 | 15 |
| [backend/src/common/common.service.ts](/backend/src/common/common.service.ts) | TypeScript | 25 | 3 | 7 | 35 |
| [backend/src/common/const/filter-mapper.const.ts](/backend/src/common/const/filter-mapper.const.ts) | TypeScript | -38 | 0 | -4 | -42 |
| [backend/src/common/dto/paginate.dto.ts](/backend/src/common/dto/paginate.dto.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/common/dto/validators/paginate-query.validator.ts](/backend/src/common/dto/validators/paginate-query.validator.ts) | TypeScript | -55 | -5 | -10 | -70 |
| [backend/src/common/guards/paginate-query.guard.ts](/backend/src/common/guards/paginate-query.guard.ts) | TypeScript | -49 | -5 | -9 | -63 |
| [backend/src/common/interceptors/serialize.interceptor.ts](/backend/src/common/interceptors/serialize.interceptor.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/common/seeds/category.seed.ts](/backend/src/common/seeds/category.seed.ts) | TypeScript | 126 | 0 | 9 | 135 |
| [backend/src/common/seeds/product.seed.ts](/backend/src/common/seeds/product.seed.ts) | TypeScript | 25 | 0 | 3 | 28 |
| [backend/src/common/utils/with-retry.ts](/backend/src/common/utils/with-retry.ts) | TypeScript | 47 | 10 | 10 | 67 |
| [backend/src/data/beauty-products.ts](/backend/src/data/beauty-products.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/data/book-products.ts](/backend/src/data/book-products.ts) | TypeScript | 4 | 0 | 0 | 4 |
| [backend/src/data/clothing-products.ts](/backend/src/data/clothing-products.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/data/food-products.ts](/backend/src/data/food-products.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/data/living-products.ts](/backend/src/data/living-products.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/data/shoes-products.ts](/backend/src/data/shoes-products.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/inquiry/inquiry.controller.ts](/backend/src/inquiry/inquiry.controller.ts) | TypeScript | 3 | 0 | 0 | 3 |
| [backend/src/inquiry/inquiry.module.ts](/backend/src/inquiry/inquiry.module.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/inquiry/inquiry.service.ts](/backend/src/inquiry/inquiry.service.ts) | TypeScript | -24 | 1 | -5 | -28 |
| [backend/src/order/entity/order.entity.ts](/backend/src/order/entity/order.entity.ts) | TypeScript | 0 | 5 | 0 | 5 |
| [backend/src/order/entity/shipment.entity.ts](/backend/src/order/entity/shipment.entity.ts) | TypeScript | 15 | 0 | 0 | 15 |
| [backend/src/order/listeners/order-event.listener.ts](/backend/src/order/listeners/order-event.listener.ts) | TypeScript | 7 | 4 | 3 | 14 |
| [backend/src/order/order.controller.ts](/backend/src/order/order.controller.ts) | TypeScript | 7 | 0 | 0 | 7 |
| [backend/src/order/order.module.ts](/backend/src/order/order.module.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/order/order.service.ts](/backend/src/order/order.service.ts) | TypeScript | 37 | 5 | 9 | 51 |
| [backend/src/payment/dto/verify-payment.dto.ts](/backend/src/payment/dto/verify-payment.dto.ts) | TypeScript | 0 | 2 | 0 | 2 |
| [backend/src/payment/dto/webhook-payment.dto.ts](/backend/src/payment/dto/webhook-payment.dto.ts) | TypeScript | 19 | 10 | 5 | 34 |
| [backend/src/payment/entity/payment.entity.ts](/backend/src/payment/entity/payment.entity.ts) | TypeScript | 0 | 2 | 0 | 2 |
| [backend/src/payment/payment.controller.ts](/backend/src/payment/payment.controller.ts) | TypeScript | 15 | 1 | 2 | 18 |
| [backend/src/payment/payment.service.ts](/backend/src/payment/payment.service.ts) | TypeScript | 68 | 12 | 12 | 92 |
| [backend/src/product/dto/product-query.dto.ts](/backend/src/product/dto/product-query.dto.ts) | TypeScript | 5 | 5 | 0 | 10 |
| [backend/src/product/dto/product-response.dto.ts](/backend/src/product/dto/product-response.dto.ts) | TypeScript | 7 | 0 | 2 | 9 |
| [backend/src/product/interfaces/product-search.interface.ts](/backend/src/product/interfaces/product-search.interface.ts) | TypeScript | 38 | 2 | 7 | 47 |
| [backend/src/product/product-search.service.ts](/backend/src/product/product-search.service.ts) | TypeScript | 253 | 35 | 49 | 337 |
| [backend/src/product/product.controller.ts](/backend/src/product/product.controller.ts) | TypeScript | 6 | 1 | 0 | 7 |
| [backend/src/product/product.module.ts](/backend/src/product/product.module.ts) | TypeScript | 14 | 0 | 0 | 14 |
| [backend/src/product/product.service.spec.ts](/backend/src/product/product.service.spec.ts) | TypeScript | 46 | 3 | 13 | 62 |
| [backend/src/product/product.service.ts](/backend/src/product/product.service.ts) | TypeScript | 41 | 8 | 2 | 51 |
| [backend/src/review/listeners/review-event.listener.ts](/backend/src/review/listeners/review-event.listener.ts) | TypeScript | 13 | 3 | -1 | 15 |
| [backend/src/review/review.controller.ts](/backend/src/review/review.controller.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/review/review.module.ts](/backend/src/review/review.module.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/review/review.service.ts](/backend/src/review/review.service.ts) | TypeScript | -28 | 0 | -4 | -32 |
| [backend/src/seller/dto/seller-application-query.dto.ts](/backend/src/seller/dto/seller-application-query.dto.ts) | TypeScript | 8 | 0 | 2 | 10 |
| [backend/src/seller/seller.controller.ts](/backend/src/seller/seller.controller.ts) | TypeScript | 4 | 0 | 0 | 4 |
| [backend/src/seller/seller.module.ts](/backend/src/seller/seller.module.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/seller/seller.service.ts](/backend/src/seller/seller.service.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/settlement/listeners/settlement-event.listener.ts](/backend/src/settlement/listeners/settlement-event.listener.ts) | TypeScript | 7 | 0 | 1 | 8 |
| [backend/src/settlement/settlement.controller.ts](/backend/src/settlement/settlement.controller.ts) | TypeScript | 4 | 0 | 0 | 4 |
| [backend/src/user/user.controller.ts](/backend/src/user/user.controller.ts) | TypeScript | 4 | 0 | 0 | 4 |
| [docs/CSP\_SECURITY\_GUIDE.md](/docs/CSP_SECURITY_GUIDE.md) | Markdown | 177 | 1 | 48 | 226 |
| [docs/ERRORS.md](/docs/ERRORS.md) | Markdown | 85 | 0 | 0 | 85 |
| [docs/SECURITY\_RECOMMENDATIONS.md](/docs/SECURITY_RECOMMENDATIONS.md) | Markdown | 503 | 0 | 103 | 606 |
| [docs/SOLUTION.md](/docs/SOLUTION.md) | Markdown | 10 | 0 | 0 | 10 |
| [docs/chat/10. Integrate\_pagination\_logic\_into\_product\_findAll\_API.md](/docs/chat/10.%20Integrate_pagination_logic_into_product_findAll_API.md) | Markdown | 336 | 0 | 83 | 419 |
| [docs/chat/11. Identify\_pagination\_candidates\_across\_backend\_APIs.md](/docs/chat/11.%20Identify_pagination_candidates_across_backend_APIs.md) | Markdown | 175 | 0 | 51 | 226 |
| [docs/chat/12. Implement\_Elasticsearch\_search\_functionality.md](/docs/chat/12.%20Implement_Elasticsearch_search_functionality.md) | Markdown | 410 | 0 | 140 | 550 |
| [docs/chat/13. Manage\_login\_state\_across\_browser\_tabs.md](/docs/chat/13.%20Manage_login_state_across_browser_tabs.md) | Markdown | 0 | 0 | 1 | 1 |
| [docs/chat/13\_Manage\_login\_state\_across\_browser\_tabs.md](/docs/chat/13_Manage_login_state_across_browser_tabs.md) | Markdown | 225 | 0 | 77 | 302 |
| [docs/chat/14. Implement\_checkout\_and\_payment\_flow\_with\_Portone.md](/docs/chat/14.%20Implement_checkout_and_payment_flow_with_Portone.md) | Markdown | 258 | 0 | 102 | 360 |
| [docs/frontend-architecture.md.md](/docs/frontend-architecture.md.md) | Markdown | 211 | 0 | 11 | 222 |
| [frontend/package.json](/frontend/package.json) | JSON | 2 | 0 | 0 | 2 |
| [frontend/postcss.config.js](/frontend/postcss.config.js) | JavaScript | 6 | 0 | 1 | 7 |
| [frontend/src/app/(auth)/check-email/page.tsx](/frontend/src/app/(auth)/check-email/page.tsx) | TypeScript JSX | 66 | 0 | 11 | 77 |
| [frontend/src/app/(auth)/layout.tsx](/frontend/src/app/(auth)/layout.tsx) | TypeScript JSX | 7 | 0 | 1 | 8 |
| [frontend/src/app/(auth)/login/page.tsx](/frontend/src/app/(auth)/login/page.tsx) | TypeScript JSX | 10 | 0 | 2 | 12 |
| [frontend/src/app/(auth)/register/page.tsx](/frontend/src/app/(auth)/register/page.tsx) | TypeScript JSX | 9 | 0 | 3 | 12 |
| [frontend/src/app/(auth)/verify-email/page.tsx](/frontend/src/app/(auth)/verify-email/page.tsx) | TypeScript JSX | 65 | 0 | 9 | 74 |
| [frontend/src/app/(main)/admin/audit-logs/page.tsx](/frontend/src/app/(main)/admin/audit-logs/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/categories/page.tsx](/frontend/src/app/(main)/admin/categories/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/layout.tsx](/frontend/src/app/(main)/admin/layout.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/orders/\[orderNumber\]/page.tsx](/frontend/src/app/(main)/admin/orders/%5BorderNumber%5D/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/orders/page.tsx](/frontend/src/app/(main)/admin/orders/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/page.tsx](/frontend/src/app/(main)/admin/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/products/page.tsx](/frontend/src/app/(main)/admin/products/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/sellers/page.tsx](/frontend/src/app/(main)/admin/sellers/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/admin/settlements/page.tsx](/frontend/src/app/(main)/admin/settlements/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/cart/CartItemRow.tsx](/frontend/src/app/(main)/cart/CartItemRow.tsx) | TypeScript JSX | 82 | 5 | 15 | 102 |
| [frontend/src/app/(main)/cart/page.tsx](/frontend/src/app/(main)/cart/page.tsx) | TypeScript JSX | 117 | 5 | 20 | 142 |
| [frontend/src/app/(main)/checkout/complete/page.tsx](/frontend/src/app/(main)/checkout/complete/page.tsx) | TypeScript JSX | 132 | 9 | 23 | 164 |
| [frontend/src/app/(main)/checkout/page.tsx](/frontend/src/app/(main)/checkout/page.tsx) | TypeScript JSX | 265 | 17 | 35 | 317 |
| [frontend/src/app/(main)/layout.tsx](/frontend/src/app/(main)/layout.tsx) | TypeScript JSX | 20 | 0 | 2 | 22 |
| [frontend/src/app/(main)/my/cart/page.tsx](/frontend/src/app/(main)/my/cart/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/inquiries/page.tsx](/frontend/src/app/(main)/my/inquiries/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/layout.tsx](/frontend/src/app/(main)/my/layout.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/orders/\[orderNumber\]/page.tsx](/frontend/src/app/(main)/my/orders/%5BorderNumber%5D/page.tsx) | TypeScript JSX | 412 | 23 | 39 | 474 |
| [frontend/src/app/(main)/my/orders/page.tsx](/frontend/src/app/(main)/my/orders/page.tsx) | TypeScript JSX | 218 | 11 | 26 | 255 |
| [frontend/src/app/(main)/my/page.tsx](/frontend/src/app/(main)/my/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/password/page.tsx](/frontend/src/app/(main)/my/password/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/reviews/page.tsx](/frontend/src/app/(main)/my/reviews/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/seller-apply/page.tsx](/frontend/src/app/(main)/my/seller-apply/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/my/wishlist/page.tsx](/frontend/src/app/(main)/my/wishlist/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/page.tsx](/frontend/src/app/(main)/page.tsx) | TypeScript JSX | 40 | 6 | 7 | 53 |
| [frontend/src/app/(main)/product/Products.tsx](/frontend/src/app/(main)/product/Products.tsx) | TypeScript JSX | 15 | 0 | 8 | 23 |
| [frontend/src/app/(main)/products/ProductsClient.tsx](/frontend/src/app/(main)/products/ProductsClient.tsx) | TypeScript JSX | 206 | 7 | 25 | 238 |
| [frontend/src/app/(main)/products/\[id\]/ProductDetailClient.tsx](/frontend/src/app/(main)/products/%5Bid%5D/ProductDetailClient.tsx) | TypeScript JSX | 38 | 6 | 8 | 52 |
| [frontend/src/app/(main)/products/\[id\]/ProductGallery.tsx](/frontend/src/app/(main)/products/%5Bid%5D/ProductGallery.tsx) | TypeScript JSX | 81 | 6 | 14 | 101 |
| [frontend/src/app/(main)/products/\[id\]/ProductInfo.tsx](/frontend/src/app/(main)/products/%5Bid%5D/ProductInfo.tsx) | TypeScript JSX | 279 | 24 | 29 | 332 |
| [frontend/src/app/(main)/products/\[id\]/ProductTabs.tsx](/frontend/src/app/(main)/products/%5Bid%5D/ProductTabs.tsx) | TypeScript JSX | 138 | 7 | 10 | 155 |
| [frontend/src/app/(main)/products/\[id\]/RelatedProducts.tsx](/frontend/src/app/(main)/products/%5Bid%5D/RelatedProducts.tsx) | TypeScript JSX | 56 | 0 | 8 | 64 |
| [frontend/src/app/(main)/products/\[id\]/ReviewSection.tsx](/frontend/src/app/(main)/products/%5Bid%5D/ReviewSection.tsx) | TypeScript JSX | 73 | 6 | 11 | 90 |
| [frontend/src/app/(main)/products/\[id\]/page.tsx](/frontend/src/app/(main)/products/%5Bid%5D/page.tsx) | TypeScript JSX | 54 | 3 | 10 | 67 |
| [frontend/src/app/(main)/products/page.tsx](/frontend/src/app/(main)/products/page.tsx) | TypeScript JSX | 12 | 0 | 2 | 14 |
| [frontend/src/app/(main)/seller/inquiries/page.tsx](/frontend/src/app/(main)/seller/inquiries/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/seller/layout.tsx](/frontend/src/app/(main)/seller/layout.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/seller/orders/page.tsx](/frontend/src/app/(main)/seller/orders/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/seller/page.tsx](/frontend/src/app/(main)/seller/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/seller/products/new/page.tsx](/frontend/src/app/(main)/seller/products/new/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/seller/products/page.tsx](/frontend/src/app/(main)/seller/products/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/(main)/seller/settlements/page.tsx](/frontend/src/app/(main)/seller/settlements/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/admin/page.tsx](/frontend/src/app/admin/page.tsx) | TypeScript JSX | -6 | 0 | -2 | -8 |
| [frontend/src/app/global.css](/frontend/src/app/global.css) | PostCSS | 3 | 0 | 1 | 4 |
| [frontend/src/app/layout.tsx](/frontend/src/app/layout.tsx) | TypeScript JSX | -4 | 0 | 0 | -4 |
| [frontend/src/app/login/page.tsx](/frontend/src/app/login/page.tsx) | TypeScript JSX | -14 | 0 | -4 | -18 |
| [frontend/src/app/not-found.tsx](/frontend/src/app/not-found.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/app/page.tsx](/frontend/src/app/page.tsx) | TypeScript JSX | -16 | -2 | -3 | -21 |
| [frontend/src/app/product/Products.tsx](/frontend/src/app/product/Products.tsx) | TypeScript JSX | -15 | 0 | -7 | -22 |
| [frontend/src/app/register/page.tsx](/frontend/src/app/register/page.tsx) | TypeScript JSX | -7 | 0 | -2 | -9 |
| [frontend/src/components/banner/Banner.tsx](/frontend/src/components/banner/Banner.tsx) | TypeScript JSX | 55 | 7 | 13 | 75 |
| [frontend/src/components/banner/BannerSection.tsx](/frontend/src/components/banner/BannerSection.tsx) | TypeScript JSX | -23 | 0 | -1 | -24 |
| [frontend/src/components/common/Badge/Badge.tsx](/frontend/src/components/common/Badge/Badge.tsx) | TypeScript JSX | 73 | 1 | 9 | 83 |
| [frontend/src/components/common/Badge/index.ts](/frontend/src/components/common/Badge/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/Button/Button.tsx](/frontend/src/components/common/Button/Button.tsx) | TypeScript JSX | 83 | 1 | 5 | 89 |
| [frontend/src/components/common/Button/index.ts](/frontend/src/components/common/Button/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/Card/Card.tsx](/frontend/src/components/common/Card/Card.tsx) | TypeScript JSX | 137 | 10 | 12 | 159 |
| [frontend/src/components/common/Card/index.ts](/frontend/src/components/common/Card/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/Input/Input.tsx](/frontend/src/components/common/Input/Input.tsx) | TypeScript JSX | 69 | 0 | 6 | 75 |
| [frontend/src/components/common/Input/index.ts](/frontend/src/components/common/Input/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/Modal/Modal.tsx](/frontend/src/components/common/Modal/Modal.tsx) | TypeScript JSX | 118 | 13 | 16 | 147 |
| [frontend/src/components/common/Modal/index.ts](/frontend/src/components/common/Modal/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/SearchBar/CategorySelect.tsx](/frontend/src/components/common/SearchBar/CategorySelect.tsx) | TypeScript JSX | 34 | 0 | 6 | 40 |
| [frontend/src/components/common/SearchBar/SearchBar.tsx](/frontend/src/components/common/SearchBar/SearchBar.tsx) | TypeScript JSX | 20 | 0 | 3 | 23 |
| [frontend/src/components/common/Select/Select.tsx](/frontend/src/components/common/Select/Select.tsx) | TypeScript JSX | 107 | 3 | 10 | 120 |
| [frontend/src/components/common/Select/index.ts](/frontend/src/components/common/Select/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/Skeleton/Skeleton.tsx](/frontend/src/components/common/Skeleton/Skeleton.tsx) | TypeScript JSX | 11 | 0 | 2 | 13 |
| [frontend/src/components/common/Spinner/Spinner.tsx](/frontend/src/components/common/Spinner/Spinner.tsx) | TypeScript JSX | 49 | 1 | 6 | 56 |
| [frontend/src/components/common/Spinner/index.ts](/frontend/src/components/common/Spinner/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/Textarea/Textarea.tsx](/frontend/src/components/common/Textarea/Textarea.tsx) | TypeScript JSX | 88 | 2 | 7 | 97 |
| [frontend/src/components/common/Textarea/index.ts](/frontend/src/components/common/Textarea/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/components/common/index.ts](/frontend/src/components/common/index.ts) | TypeScript | 8 | 0 | 1 | 9 |
| [frontend/src/components/footer/Footer.tsx](/frontend/src/components/footer/Footer.tsx) | TypeScript JSX | 132 | 9 | 9 | 150 |
| [frontend/src/components/forms/BaseForm.tsx](/frontend/src/components/forms/BaseForm.tsx) | TypeScript JSX | -94 | 2 | -12 | -104 |
| [frontend/src/components/forms/LoginForm.tsx](/frontend/src/components/forms/LoginForm.tsx) | TypeScript JSX | -6 | 0 | 0 | -6 |
| [frontend/src/components/forms/RegisterForm.tsx](/frontend/src/components/forms/RegisterForm.tsx) | TypeScript JSX | -1 | 0 | 0 | -1 |
| [frontend/src/components/header/Header.tsx](/frontend/src/components/header/Header.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/header/categoryBar/CategoryBar.tsx](/frontend/src/components/header/categoryBar/CategoryBar.tsx) | TypeScript JSX | -6 | 0 | -2 | -8 |
| [frontend/src/components/header/mainHeader/HomeCart.tsx](/frontend/src/components/header/mainHeader/HomeCart.tsx) | TypeScript JSX | 25 | 0 | 5 | 30 |
| [frontend/src/components/header/mainHeader/MainHeader.tsx](/frontend/src/components/header/mainHeader/MainHeader.tsx) | TypeScript JSX | 17 | 0 | 2 | 19 |
| [frontend/src/components/header/navbar/Category.tsx](/frontend/src/components/header/navbar/Category.tsx) | TypeScript JSX | -60 | 0 | 0 | -60 |
| [frontend/src/components/header/navbar/CategoryBar.tsx](/frontend/src/components/header/navbar/CategoryBar.tsx) | TypeScript JSX | 31 | 1 | 8 | 40 |
| [frontend/src/components/header/navbar/NavbarButton.tsx](/frontend/src/components/header/navbar/NavbarButton.tsx) | TypeScript JSX | 2 | 0 | 1 | 3 |
| [frontend/src/components/header/topbar/LogIn.tsx](/frontend/src/components/header/topbar/LogIn.tsx) | TypeScript JSX | 13 | 0 | 3 | 16 |
| [frontend/src/components/header/topbar/Topbar.tsx](/frontend/src/components/header/topbar/Topbar.tsx) | TypeScript JSX | -6 | 0 | 0 | -6 |
| [frontend/src/components/header/topbar/UserMenu.tsx](/frontend/src/components/header/topbar/UserMenu.tsx) | TypeScript JSX | 84 | 1 | 7 | 92 |
| [frontend/src/components/home/CategoryShortcuts.tsx](/frontend/src/components/home/CategoryShortcuts.tsx) | TypeScript JSX | 44 | 1 | 7 | 52 |
| [frontend/src/components/home/CategoryTabSection.tsx](/frontend/src/components/home/CategoryTabSection.tsx) | TypeScript JSX | 98 | 2 | 15 | 115 |
| [frontend/src/components/home/ProductCard.tsx](/frontend/src/components/home/ProductCard.tsx) | TypeScript JSX | 72 | 7 | 13 | 92 |
| [frontend/src/components/home/ProductSection.tsx](/frontend/src/components/home/ProductSection.tsx) | TypeScript JSX | 54 | 1 | 8 | 63 |
| [frontend/src/components/home/SectionHeader.tsx](/frontend/src/components/home/SectionHeader.tsx) | TypeScript JSX | 27 | 2 | 3 | 32 |
| [frontend/src/components/icons/CartIcons.tsx](/frontend/src/components/icons/CartIcons.tsx) | TypeScript JSX | 20 | 0 | 4 | 24 |
| [frontend/src/components/icons/CategoryIcon.tsx](/frontend/src/components/icons/CategoryIcon.tsx) | TypeScript JSX | 21 | 0 | 5 | 26 |
| [frontend/src/components/layout/MaxWidthContainer.tsx](/frontend/src/components/layout/MaxWidthContainer.tsx) | TypeScript JSX | -5 | 0 | -1 | -6 |
| [frontend/src/contexts/AuthContext.tsx](/frontend/src/contexts/AuthContext.tsx) | TypeScript JSX | 13 | 1 | 0 | 14 |
| [frontend/src/hook/useAuthMutation.ts](/frontend/src/hook/useAuthMutation.ts) | TypeScript | 23 | 7 | 7 | 37 |
| [frontend/src/hooks/useCart.ts](/frontend/src/hooks/useCart.ts) | TypeScript | 75 | 38 | 24 | 137 |
| [frontend/src/hooks/useCategories.ts](/frontend/src/hooks/useCategories.ts) | TypeScript | 20 | 2 | 7 | 29 |
| [frontend/src/hooks/useOrder.ts](/frontend/src/hooks/useOrder.ts) | TypeScript | 58 | 16 | 19 | 93 |
| [frontend/src/hooks/useWishlist.ts](/frontend/src/hooks/useWishlist.ts) | TypeScript | 22 | 13 | 7 | 42 |
| [frontend/src/lib/axios/axios-http-client.ts](/frontend/src/lib/axios/axios-http-client.ts) | TypeScript | 3 | 1 | 1 | 5 |
| [frontend/src/lib/category-icon-map.ts](/frontend/src/lib/category-icon-map.ts) | TypeScript | 13 | 6 | 3 | 22 |
| [frontend/src/lib/react-query/cart-query-options.ts](/frontend/src/lib/react-query/cart-query-options.ts) | TypeScript | 15 | 10 | 3 | 28 |
| [frontend/src/lib/react-query/category-query-options.ts](/frontend/src/lib/react-query/category-query-options.ts) | TypeScript | 9 | 0 | 2 | 11 |
| [frontend/src/lib/react-query/order-query-options.ts](/frontend/src/lib/react-query/order-query-options.ts) | TypeScript | 25 | 0 | 4 | 29 |
| [frontend/src/lib/react-query/products-query-options.ts](/frontend/src/lib/react-query/products-query-options.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [frontend/src/model/cart.ts](/frontend/src/model/cart.ts) | TypeScript | 26 | 0 | 3 | 29 |
| [frontend/src/model/order.ts](/frontend/src/model/order.ts) | TypeScript | 100 | 11 | 18 | 129 |
| [frontend/src/model/paginate-param.ts](/frontend/src/model/paginate-param.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [frontend/src/model/product.ts](/frontend/src/model/product.ts) | TypeScript | 66 | 1 | 8 | 75 |
| [frontend/src/providers/reactQuery-provider.tsx](/frontend/src/providers/reactQuery-provider.tsx) | TypeScript JSX | -3 | 0 | 0 | -3 |
| [frontend/src/service/auth-storage.ts](/frontend/src/service/auth-storage.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [frontend/src/service/auth.ts](/frontend/src/service/auth.ts) | TypeScript | 10 | 1 | 4 | 15 |
| [frontend/src/service/cart.ts](/frontend/src/service/cart.ts) | TypeScript | 16 | 4 | 6 | 26 |
| [frontend/src/service/category.ts](/frontend/src/service/category.ts) | TypeScript | 12 | 0 | 3 | 15 |
| [frontend/src/service/order.ts](/frontend/src/service/order.ts) | TypeScript | 20 | 0 | 6 | 26 |
| [frontend/src/service/payment.ts](/frontend/src/service/payment.ts) | TypeScript | 8 | 0 | 3 | 11 |
| [frontend/src/service/products.ts](/frontend/src/service/products.ts) | TypeScript | 6 | -5 | -1 | 0 |
| [frontend/src/service/wishlist.ts](/frontend/src/service/wishlist.ts) | TypeScript | 7 | 6 | 2 | 15 |
| [frontend/tailwind.config.js](/frontend/tailwind.config.js) | JavaScript | 54 | 3 | 1 | 58 |
| [frontend/tsconfig.json](/frontend/tsconfig.json) | JSON with Comments | 2 | 0 | 0 | 2 |
| [mocks/src/lib/beauty/beauty.ts](/mocks/src/lib/beauty/beauty.ts) | TypeScript | 155 | 0 | 0 | 155 |
| [mocks/src/lib/book/book.ts](/mocks/src/lib/book/book.ts) | TypeScript | 305 | 0 | 0 | 305 |
| [mocks/src/lib/clothing/clothing.ts](/mocks/src/lib/clothing/clothing.ts) | TypeScript | 160 | 0 | 0 | 160 |
| [mocks/src/lib/food/food.ts](/mocks/src/lib/food/food.ts) | TypeScript | 160 | 0 | 0 | 160 |
| [mocks/src/lib/livingProduct/livingProduct.ts](/mocks/src/lib/livingProduct/livingProduct.ts) | TypeScript | 155 | 0 | -1 | 154 |
| [mocks/src/lib/shoes/shoes.ts](/mocks/src/lib/shoes/shoes.ts) | TypeScript | 152 | 0 | 0 | 152 |
| [package-lock.json](/package-lock.json) | JSON | 25,531 | 0 | 1 | 25,532 |
| [package.json](/package.json) | JSON | 11 | 0 | 0 | 11 |
| [shared/src/lib/types/auth/login.ts](/shared/src/lib/types/auth/login.ts) | TypeScript | -10 | -8 | -3 | -21 |
| [shared/src/lib/types/auth/register.ts](/shared/src/lib/types/auth/register.ts) | TypeScript | -1 | 0 | 0 | -1 |
| [shared/src/lib/types/product/categories/sports.ts](/shared/src/lib/types/product/categories/sports.ts) | TypeScript | -7 | 1 | 0 | -6 |
| [shared/src/lib/types/product/category.ts](/shared/src/lib/types/product/category.ts) | TypeScript | 33 | 1 | 2 | 36 |
| [shared/src/lib/types/product/index.ts](/shared/src/lib/types/product/index.ts) | TypeScript | -1 | 0 | 0 | -1 |
| [shared/src/lib/types/product/product.ts](/shared/src/lib/types/product/product.ts) | TypeScript | 6 | 0 | 1 | 7 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details