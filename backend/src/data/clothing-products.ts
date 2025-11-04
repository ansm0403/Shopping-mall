import { clothingProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";

export const clothingProductsData = clothingProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate,
  rating: product.rating,
  category: ProductCategory.CLOTHING,
  specs: {
    size: product.size,
    color: product.color,
    material: product.material,
    style: product.style,
    gender: product.gender,
    season: product.season,
  },
}));