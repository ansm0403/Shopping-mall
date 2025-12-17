import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register } from "../service/auth";
import type { LoginRequest, RegisterRequest } from "@shopping-mall/shared";
import { authStorage } from "../service/auth-storage";
/**
 * 로그인 mutation hook
 */
export function useLoginMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: (data: LoginRequest) => login(data),
        onSuccess: (response) => {
            authStorage.setTokens(response.data.accessToken);

            // user 정보를 React Query 캐시에 저장
            queryClient.setQueryData(['auth', 'user'], response.data.user);
        }
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

export function useLogoutMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationKey: ["auth", "logout"],
        mutationFn: async () => {
            // 서버에 로그아웃 요청 (선택사항)
            // await authClient.post('/auth/logout');
        },
        onSuccess: () => {
            // 1. localStorage 클리어
            authStorage.clearToken();

            // 2. React Query 캐시 클리어
            queryClient.setQueryData(['auth', 'user'], null);
            queryClient.clear(); // 모든 캐시 삭제

            // 3. 로그인 페이지로 리다이렉트
            router.push('/login');
        },
    });
}