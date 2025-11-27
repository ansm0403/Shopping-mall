import { httpClient } from "../../../src/lib/axios/axios-http-client";

export function getAllProducts(){
    return httpClient.get('/product/all');
}

export function getCategoryProducts(category: string){
    
}