import { foodProducts } from "./raw/food"

export const foodProductsData = foodProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate || 0,
  rating: product.rating || null,
  category: product.category,
  status: product.status,
  stockQuantity: product.stockQuantity || 0,
  salesCount: product.salesCount || 0,
  viewCount: product.viewCount || 0,
  approvalStatus: product.approvalStatus,
  salesType: product.salesType === 'preorder' ? 'pre_order' : 'normal',
  specs: {
    origin: product.origin,
    nutrition: product.nutrition,
  },
}));