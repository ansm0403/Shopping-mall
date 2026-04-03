import { livingProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";

export const livingProductsData = livingProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate || 0,
  rating: product.rating || null,
  category: ProductCategory.LIVING,
  status: product.status,
  stockQuantity: product.stockQuantity || 0,
  salesCount: product.salesCount || 0,
  viewCount: product.viewCount || 0,
  approvalStatus: product.approvalStatus,
  salesType: product.salesType === 'preorder' ? 'pre_order' : 'normal',
  specs: {
    material: product.material,
    usage: product.usage,
    origin: product.origin,
    dimensions: product.dimensions,
    weight: product.weight,
    capacity: product.capacity,
    color: product.color,
  },
}));