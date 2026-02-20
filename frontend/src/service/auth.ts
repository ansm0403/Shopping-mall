import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@shopping-mall/shared";
import { authClient, publicClient } from "../lib/axios/axios-http-client";

export interface LogoutResponse {
    message: string;
}

export async function login(data: LoginRequest) {
    return publicClient.post<LoginResponse>("/auth/login", data);
}

export async function register(data: RegisterRequest) {
    return publicClient.post<RegisterResponse>("/auth/register", data);
}

export async function getMe(){
    return authClient.get("/auth/me");
}

export async function logout(accessToken: string){
    return authClient.post<LogoutResponse>("/auth/logout", { accessToken });
}