import { beautyProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";

export const beautyProductsData = beautyProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate,
  rating: product.rating,
  category: ProductCategory.BEAUTY,
  specs: {
    volume: product.volume,
    skinType: product.skinType,
    madeIn: product.madeIn,
  }
}));