import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@shopping-mall/shared";
import { publicClient } from "../lib/axios/axios-http-client";

export function login(data: LoginRequest) {
    return publicClient.post<LoginResponse>("/auth/login", data);
}

export function register(data: RegisterRequest) {
    return publicClient.post<RegisterResponse>("/auth/register", data);
}