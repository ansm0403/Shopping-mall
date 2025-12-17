import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@shopping-mall/shared";
import { authClient, publicClient } from "../lib/axios/axios-http-client";

export async function login(data: LoginRequest) {
    return publicClient.post<LoginResponse>("/auth/login", data);
}

export async function register(data: RegisterRequest) {
    return publicClient.post<RegisterResponse>("/auth/register", data);
}

export async function getMe(){
    return authClient.get("/auth/me");
}

export async function logout(){
    return authClient.post("/auth/logout");
}