# Diff Details

Date : 2026-03-30 09:54:47

Directory c:\\Users\\kiria\\Desktop\\fullstack\\shopping_mall

Total : 37 files,  859 codes, 20 comments, 193 blanks, all 1072 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/src/order/dto/order-response.dto.ts](/backend/src/order/dto/order-response.dto.ts) | TypeScript | 18 | 0 | 2 | 20 |
| [backend/src/order/dto/ship-order.dto.ts](/backend/src/order/dto/ship-order.dto.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [backend/src/order/entity/order.entity.ts](/backend/src/order/entity/order.entity.ts) | TypeScript | 9 | 0 | 4 | 13 |
| [backend/src/order/entity/shipment.entity.ts](/backend/src/order/entity/shipment.entity.ts) | TypeScript | 33 | 0 | 11 | 44 |
| [backend/src/order/events/shipment.events.ts](/backend/src/order/events/shipment.events.ts) | TypeScript | 28 | 0 | 4 | 32 |
| [backend/src/order/listeners/order-event.listener.ts](/backend/src/order/listeners/order-event.listener.ts) | TypeScript | 35 | 1 | 4 | 40 |
| [backend/src/order/order.controller.ts](/backend/src/order/order.controller.ts) | TypeScript | 18 | 0 | 2 | 20 |
| [backend/src/order/order.module.ts](/backend/src/order/order.module.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/order/order.service.ts](/backend/src/order/order.service.ts) | TypeScript | 183 | 13 | 38 | 234 |
| [backend/src/payment/payment.controller.ts](/backend/src/payment/payment.controller.ts) | TypeScript | 14 | 1 | 2 | 17 |
| [backend/src/payment/payment.module.ts](/backend/src/payment/payment.module.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [backend/src/payment/payment.service.ts](/backend/src/payment/payment.service.ts) | TypeScript | 57 | 4 | 11 | 72 |
| [backend/src/product/entity/product.entity.ts](/backend/src/product/entity/product.entity.ts) | TypeScript | 2 | 0 | 2 | 4 |
| [backend/src/review/dto/create-review.dto.ts](/backend/src/review/dto/create-review.dto.ts) | TypeScript | 18 | 0 | 6 | 24 |
| [backend/src/review/dto/review-response.dto.ts](/backend/src/review/dto/review-response.dto.ts) | TypeScript | 25 | 0 | 10 | 35 |
| [backend/src/review/dto/update-review.dto.ts](/backend/src/review/dto/update-review.dto.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [backend/src/review/entity/review.entity.ts](/backend/src/review/entity/review.entity.ts) | TypeScript | 11 | 0 | 5 | 16 |
| [backend/src/review/events/review.events.ts](/backend/src/review/events/review.events.ts) | TypeScript | 13 | 0 | 2 | 15 |
| [backend/src/review/listeners/review-event.listener.ts](/backend/src/review/listeners/review-event.listener.ts) | TypeScript | 45 | 0 | 10 | 55 |
| [backend/src/user/dto/change-password.dto.ts](/backend/src/user/dto/change-password.dto.ts) | TypeScript | 8 | 0 | 3 | 11 |
| [backend/src/user/dto/update-profile.dto.ts](/backend/src/user/dto/update-profile.dto.ts) | TypeScript | 15 | 0 | 4 | 19 |
| [backend/src/user/dto/user-profile-response.dto.ts](/backend/src/user/dto/user-profile-response.dto.ts) | TypeScript | 23 | 0 | 9 | 32 |
| [backend/src/user/entity/user.entity.ts](/backend/src/user/entity/user.entity.ts) | TypeScript | -3 | 0 | -1 | -4 |
| [backend/src/user/user.controller.ts](/backend/src/user/user.controller.ts) | TypeScript | 27 | 0 | 3 | 30 |
| [backend/src/user/user.module.ts](/backend/src/user/user.module.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [backend/src/user/user.service.ts](/backend/src/user/user.service.ts) | TypeScript | 53 | 0 | 13 | 66 |
| [backend/src/wish-list/dto/toggle-wishlist.dto.ts](/backend/src/wish-list/dto/toggle-wishlist.dto.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [backend/src/wish-list/dto/wishlist-response.dto.ts](/backend/src/wish-list/dto/wishlist-response.dto.ts) | TypeScript | 23 | 0 | 9 | 32 |
| [backend/src/wish-list/entity/wishList.entity.ts](/backend/src/wish-list/entity/wishList.entity.ts) | TypeScript | 7 | 0 | 3 | 10 |
| [backend/src/wish-list/wish-list.controller.ts](/backend/src/wish-list/wish-list.controller.ts) | TypeScript | 38 | 0 | 3 | 41 |
| [backend/src/wish-list/wish-list.module.ts](/backend/src/wish-list/wish-list.module.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [backend/src/wish-list/wish-list.service.ts](/backend/src/wish-list/wish-list.service.ts) | TypeScript | 75 | 0 | 13 | 88 |
| [shared/src/lib/types/order/index.ts](/shared/src/lib/types/order/index.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [shared/src/lib/types/order/order.ts](/shared/src/lib/types/order/order.ts) | TypeScript | 5 | 0 | 0 | 5 |
| [shared/src/lib/types/order/shipment.ts](/shared/src/lib/types/order/shipment.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [shared/src/lib/types/user/user.ts](/shared/src/lib/types/user/user.ts) | TypeScript | 13 | 0 | 4 | 17 |
| [shared/src/lib/types/wishList/wishList.ts](/shared/src/lib/types/wishList/wishList.ts) | TypeScript | 9 | 1 | 4 | 14 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details