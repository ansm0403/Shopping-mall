import { foodProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";

export const foodProductsData = foodProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate,
  rating: product.rating,
  category: ProductCategory.FOOD,
  specs: {
    origin: product.origin,
    nutrition: product.nutrition,
  },
}));