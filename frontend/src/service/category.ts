import { publicClient } from "../lib/axios/axios-http-client";

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  depth: number;
  sortOrder: number;
  children: CategoryTreeNode[];
}

export function getCategoryTree() {
  return publicClient.get<CategoryTreeNode[]>('/categories').then((res) => res.data);
}
