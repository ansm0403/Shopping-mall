import { useQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "../../../src/lib/react-query/products-query-options";
import { PaginateParam } from "../model/paginate-param";


export const useProducts = {
    All: () => useQuery(productsQueryOptions.all()),
    Paginate: (param: PaginateParam) => useQuery(productsQueryOptions.paginate(param)),
};