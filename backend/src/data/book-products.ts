import { bookProducts } from "@shopping-mall/mocks"
import { ProductCategory } from "../product/entity/product.entity";
import { spec } from "node:test/reporters";

export const bookProductsData = bookProducts.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  brand: product.brand,
  isEvent: product.isEvent,
  discountRate: product.discountRate,
  rating: product.rating,
  specs: {
    author: product.author,
    publisher: product.publisher,
    publicationDate: product.publicationDate,
    pages: product.pages,
    genre: product.genre,
  },
  category: ProductCategory.BOOK,
}));