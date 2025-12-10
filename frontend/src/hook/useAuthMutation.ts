import { useMutation } from "@tanstack/react-query";
import { login, register } from "../service/auth";
import type { LoginRequest, RegisterRequest } from "@shopping-mall/shared";

/**
 * 로그인 mutation hook
 */
export function useLoginMutation() {
    return useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: (data: LoginRequest) => login(data),
    });
}

/**
 * 회원가입 mutation hook
 */
export function useRegisterMutation() {
    return useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: (data: RegisterRequest) => register(data),
    });
}