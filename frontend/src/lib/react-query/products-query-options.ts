import { queryOptions } from "@tanstack/react-query";
import { getAllProducts, getPaginateProducts } from "../../service/products";
import { PaginateParam } from "../../model/paginate-param";

export const productsQueryOptions = {
    all: () => queryOptions({
        queryKey: [
            "products"
        ],
        queryFn: getAllProducts
    }),
    paginate: (additionalKey : PaginateParam) => queryOptions({
        queryKey: [
            "paginate",
            "products",
            additionalKey.page,
            additionalKey.limit,
            additionalKey.sortBy,
            additionalKey.sortOrder,
            additionalKey.cursor,
            additionalKey.filter
        ],
        queryFn: () => getPaginateProducts(additionalKey)
    })
}