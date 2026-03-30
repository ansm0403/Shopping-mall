import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * 이벤트 리스너 등 비동기 핸들러를 감싸는 재시도 유틸리티.
 *
 * - 리스너 핸들러가 이미 멱등하다는 전제 하에 안전하게 재시도
 * - 지수 백오프(exponential backoff) 적용
 * - 모든 시도가 실패하면 최종 에러를 로깅하고 조용히 종료 (리스너가 throw하면 안 되므로)
 *
 * 추후 Bull Queue, Outbox 패턴 등으로 전환 시
 * 이 함수를 교체하거나 제거하면 됩니다. 리스너 로직 자체는 변경 불필요.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  options?: RetryOptions,
): Promise<T | undefined> {
  const logger = new Logger('withRetry');
  const { maxAttempts, delayMs, backoffMultiplier } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        logger.warn(
          `[${context}] 시도 ${attempt}/${maxAttempts} 실패: ${lastError.message} — ${delay}ms 후 재시도`,
        );
        options?.onRetry?.(lastError, attempt);
        await sleep(delay);
      }
    }
  }

  logger.error(
    `[${context}] 최종 실패 (${maxAttempts}회 시도): ${lastError?.message}`,
    lastError?.stack,
  );

  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
