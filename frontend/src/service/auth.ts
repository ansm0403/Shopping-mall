import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from "@shopping-mall/shared";
import { authClient, publicClient } from "../lib/axios/axios-http-client";

export interface LogoutResponse {
    message: string;
}

export type UserResponse = Omit<User, 'password'>;

export async function login(data: LoginRequest) {
    return publicClient.post<LoginResponse>("/auth/login", data);
}

export async function register(data: RegisterRequest) {
    return publicClient.post<RegisterResponse>("/auth/register", data);
}

export async function getMe() {
    return authClient.get<UserResponse>("/auth/me");
}

// accessToken은 Authorization 헤더로, refreshToken은 쿠키로 자동 전송됨
export async function logout() {
    return authClient.post<LogoutResponse>("/auth/logout");
}