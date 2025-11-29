"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  TextField,
  CheckboxField,
} from "./BaseForm";

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
  const defaultValues: LoginFormValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    console.log("로그인 값:", values);
    // /api/login 호출 등
  };

  return (
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
  );
}