import { shoesProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";

export const shoesProductsData = shoesProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate,
  rating: product.rating,
  specs: {
    size: product.size,
    color: product.color,
    material: product.material,
  },
  category: ProductCategory.SHOES,
}));