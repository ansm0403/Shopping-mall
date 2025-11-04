import { livingProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";

export const livingProductsData = livingProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate,
  rating: product.rating,
  category: ProductCategory.LIVING,
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