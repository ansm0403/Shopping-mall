import { queryOptions } from "@tanstack/react-query";
import { getCategoryTree } from "../../service/category";

export const categoryQueryOptions = {
  tree: () => queryOptions({
    queryKey: ["categories", "tree"],
    queryFn: getCategoryTree,
    staleTime: 1000 * 60 * 5, // 5분 — 카테고리는 자주 바뀌지 않음
  }),
};
