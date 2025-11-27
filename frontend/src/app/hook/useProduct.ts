import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../lib/axios/axios-http-client";
import { productsQueryOptions } from "../../../src/lib/react-query/products-query-options";

export default function useProducts() {
    return useQuery(productsQueryOptions.all())
}