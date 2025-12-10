/**
 * 회원가입 요청 타입
 * Next.js 클라이언트와 Nest.js 서버 간 데이터 형식 정의
 */
export interface RegisterRequest {
  email: string;
  password: string;
  nickName: string;
  phoneNumber: string;
  address: string;
}

/**
 * 회원가입 응답 타입
 */
export interface RegisterResponse {
  message: string;
  email: string;
}
