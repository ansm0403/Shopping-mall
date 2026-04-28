"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLoginMutation } from "../../hook/useAuthMutation";
import { Form, TextField, CheckboxField } from "./BaseForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";

/**
 * Open redirect 방어:
 * - 같은 오리진 내부 경로(`/`로 시작, `//`나 `/\`로 시작 안 함)만 허용
 * - 외부 URL이나 프로토콜 상대 URL(`//evil.com`)은 차단해 홈으로 폴백
 */
function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입��해주세요.")
    .email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상 입력해주세요."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));
  const loginMutation = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: LoginFormValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);

    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      router.push(redirectTo);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        // 이메일 미인증 → 인증 안내 페이지로 이동
        router.push(`/check-email?email=${encodeURIComponent(values.email)}`);
        return;
      }

      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : null;

      setErrorMessage(message || "로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 w-full max-w-[600px] min-w-[400px]">
      <Form<LoginFormValues>
        title="로그인"
        description="계정에 로그인 해주세요."
        submitLabel="로그인"
        defaultValues={defaultValues}
        resolver={zodResolver(loginSchema)}
        variant="login"
        onSubmit={handleSubmit}
      >
        <TextField<LoginFormValues>
          name="email"
          label="이메일"
          type="email"
          placeholder="you@example.com"
        />

        <TextField<LoginFormValues>
          name="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력해주세요."
        />

        <CheckboxField<LoginFormValues> name="rememberMe">
          로그인 상태 유지
        </CheckboxField>
      </Form>

      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}

      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/find-pwd"
          className="text-gray-500 no-underline transition-colors duration-200 hover:text-blue-600 hover:font-bold"
        >
          비밀번호 찾기
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/register"
          className="text-gray-500 no-underline transition-colors duration-200 hover:text-blue-600 hover:font-bold"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
