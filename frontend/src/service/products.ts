import { publicClient } from "../lib/axios/axios-http-client";
import { PaginateParam } from "../model/paginate-param";

const productBaseUrl = "/product";

export function getAllProducts(){
    return publicClient.get(`${productBaseUrl}/all`);
}

export function getPaginateProducts(param: PaginateParam){
    const queryParams = new URLSearchParams();

    // 기본 페이지네이션 파라미터 추가
    queryParams.append('page', param.page.toString());
    queryParams.append('take', param.limit.toString());

    // sortBy, sortOrder 추가
    if (param.sortBy) {
        queryParams.append('sortBy', param.sortBy);
    }
    if (param.sortOrder) {
        queryParams.append('sortOrder', param.sortOrder);
    }

    // cursor 추가
    if (param.cursor) {
        queryParams.append('cursor', param.cursor);
    }

    // filter 파라미터 처리
    if (param.filter) {
        Object.entries(param.filter).forEach(([filterKey, filterValue]) => {
            if (filterValue) {
                Object.entries(filterValue).forEach(([operation, value]) => {
                    if (value !== undefined && value !== null) {
                        if (Array.isArray(value)) {
                            // in 연산의 경우 배열을 처리
                            queryParams.append(`filter[${filterKey}][${operation}]`, value.join(','));
                        } else {
                            queryParams.append(`filter[${filterKey}][${operation}]`, value.toString());
                        }
                    }
                });
            }
        });
    }

    const query = `${productBaseUrl}?${queryParams.toString()}`;
    return publicClient.get(query);
}

