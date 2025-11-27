import { queryOptions } from "@tanstack/react-query";
import { getAllProducts } from "../../app/service/products";

export const productsQueryOptions = {
    all: () => queryOptions({
        queryKey: [
            "products"
        ],
        queryFn: getAllProducts
    }),
    paginate: (additionalKey : {page: number, limit: number}) => queryOptions({
        queryKey: [
            "paginate", 
            "products", 
            additionalKey.page, 
            additionalKey.limit
        ],
        queryFn: () => { return "" },
    })
}