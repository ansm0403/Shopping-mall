"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styled from "@emotion/styled";
import Link from "next/link";
import { useLoginMutation } from "../../hook/useAuthMutation";
import {
  Form,
  TextField,
  CheckboxField,
} from "./BaseForm";
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
      });

      console.log('로그인 성공');

      router.push('/')
    } catch (error) {
      console.error('로그인 실패:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  return (
    <LoginFormContainer>
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

      <FooterLinks>
        <StyledLink href="/find-pwd">비밀번호 찾기</StyledLink>
        <Divider>|</Divider>
        <StyledLink href="/register">회원가입</StyledLink>
      </FooterLinks>
    </LoginFormContainer>
  );
}

const LoginFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
`;

const StyledLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #2563eb;
    font-weight: bold;
  }
`;

const Divider = styled.span`
  color: #d1d5db;
`;