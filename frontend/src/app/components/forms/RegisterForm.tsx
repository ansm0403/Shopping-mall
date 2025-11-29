"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  TextField,
  TextareaField,
  SelectField,
  CheckboxField,
} from "./BaseForm";

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "이메일을 입력해주세요.")
      .email("이메일 형식이 올바르지 않습니다."),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
    passwordConfirm: z
      .string()
      .min(6, "비밀번호 확인도 6자 이상이어야 합니다."),
    nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
    role: z.enum(["user", "seller", "admin"], {
      message: "역할을 선택해주세요.",
    }),
    bio: z
      .string()
      .max(200, "자기소개는 200자 이내로 작성해주세요.")
      .optional(),
    agreeTerms: z.literal(true, {
      message: "약관에 동의해야 합니다.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const defaultValues = {
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    role: "user" as const,
    bio: "",
  };

  const handleSubmit = async (values: SignupFormValues) => {
    console.log("회원가입 값:", values);
    // /api/signup 호출 등
  };

  return (
    <Form<SignupFormValues>
      title="회원가입"
      description="새 계정을 만들어주세요."
      submitLabel="회원가입"
      defaultValues={defaultValues}
      resolver={zodResolver(signupSchema)}
      variant="signup"
      onSubmit={handleSubmit}
    >
      <TextField<SignupFormValues>
        name="email"
        label="이메일"
        type="email"
        placeholder="you@example.com"
      />

      <TextField<SignupFormValues>
        name="nickname"
        label="닉네임"
        placeholder="닉네임을 입력해주세요."
      />

      <SelectField<SignupFormValues>
        name="role"
        label="역할"
        placeholder="역할을 선택해주세요"
        options={[
          { label: "일반 사용자", value: "user" },
          { label: "판매자", value: "seller" },
          { label: "관리자", value: "admin" },
        ]}
      />

      <TextField<SignupFormValues>
        name="password"
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력해주세요."
      />

      <TextField<SignupFormValues>
        name="passwordConfirm"
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력해주세요."
      />

      <TextareaField<SignupFormValues>
        name="bio"
        label="자기소개"
        helperText="간단한 자기소개를 적어주세요. (선택)"
        placeholder="예: 프론트엔드 개발자 상문입니다..."
        rows={4}
      />

      <CheckboxField<SignupFormValues> name="agreeTerms">
        서비스 이용 약관에 동의합니다.
      </CheckboxField>
    </Form>
  );
}