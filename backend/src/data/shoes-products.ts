import { shoesProducts } from "./raw/shoes"

export const shoesProductsData = shoesProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate || 0,
  rating: product.rating || null,
  status: product.status,
  stockQuantity: product.stockQuantity || 0,
  salesCount: product.salesCount || 0,
  viewCount: product.viewCount || 0,
  approvalStatus: product.approvalStatus,
  salesType: product.salesType === 'preorder' ? 'pre_order' : 'normal',
  specs: {
    size: product.size,
    color: product.color,
    material: product.material,
  },
  category: product.category,
}));