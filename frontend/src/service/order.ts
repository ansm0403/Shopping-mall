import { authClient } from '../lib/axios/axios-http-client';
import {
  CreateOrderRequest,
  OrderQueryParams,
} from '../model/order';

export function createOrder(dto: CreateOrderRequest) {
  return authClient.post('/orders', dto);
}

export function getMyOrders(params?: OrderQueryParams) {
  return authClient.get('/orders', { params });
}

export function getOrderDetail(orderNumber: string) {
  return authClient.get(`/orders/${orderNumber}`);
}

export function cancelOrder(orderNumber: string) {
  return authClient.patch(`/orders/${orderNumber}/cancel`);
}

export function confirmOrder(orderNumber: string) {
  return authClient.patch(`/orders/${orderNumber}/confirm`);
}
