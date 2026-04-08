import { authClient } from '../lib/axios/axios-http-client';
import { VerifyPaymentRequest, CancelPaymentRequest } from '../model/order';

export function verifyPayment(dto: VerifyPaymentRequest) {
  return authClient.post('/payments/verify', dto);
}

export function cancelPayment(orderNumber: string, dto: CancelPaymentRequest) {
  return authClient.post(`/payments/${orderNumber}/cancel`, dto);
}
