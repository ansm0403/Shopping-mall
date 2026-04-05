"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLoginMutation } from "../../hook/useAuthMutation";
import { Form, TextField, CheckboxField } from "./BaseForm";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(6, "비밀번호는 6자 이상 입력해주세요."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const defaultValues: LoginFormValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      console.log("로그인 성공");
      router.push("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
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
