"use client";

import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import {
  useForm,
  FormProvider,
  useFormContext,
  type FieldValues,
  type SubmitHandler,
  type Resolver,
  type Path,
  type DefaultValues,
} from "react-hook-form";

/* =========================
 *  Emotion 스타일
 * ========================= */

type FormContainerProps = {
  variant?: "login" | "signup" | "default";
};

const FormContainer = styled.form<FormContainerProps>`
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;

  ${({ variant }) =>
    variant === "login" &&
    css`
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
      margin: 100px auto 10px;
    `}

  ${({ variant }) =>
    variant === "signup" &&
    css`
      border-color: #2563eb;
      box-shadow: 0 20px 45px rgba(37, 99, 235, 0.25);
      margin: 20px auto 40px;
    `}
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 13px;
  color: #6b7280;
`;

const FieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #6b7280;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

const InputBase = styled.input`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb33;
  }
`;

const TextareaBase = styled.textarea`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb33;
  }
`;

const SelectBase = styled.select`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  background-color: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb33;
  }
`;


const SubmitButton = styled.button`
  margin-top: 4px;
  padding: 9px 12px;
  border-radius: 10px;
  border: none;
  background-color: #50acd6ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.08s ease,
    box-shadow 0.15s ease;

  &:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

/* =========================
 *  Form Root
 * ========================= */

export type FormProps<T extends FieldValues> = {
  title?: string;
  description?: string;
  submitLabel?: string;
  defaultValues: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  resolver?: Resolver<T>;
  variant?: "login" | "signup" | "default";
  children: React.ReactNode;
};

export function Form<T extends FieldValues>({
  title,
  description,
  submitLabel = "저장",
  defaultValues,
  onSubmit,
  resolver,
  variant = "default",
  children,
}: FormProps<T>) {
  const methods = useForm<T>({
    defaultValues,
    resolver,
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <FormProvider {...methods}>
      <FormContainer
        variant={variant}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {(title || description) && (
          <Header>
            {title && <Title>{title}</Title>}
            {description && <Description>{description}</Description>}
          </Header>
        )}

        <FieldsWrapper>{children}</FieldsWrapper>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : submitLabel}
        </SubmitButton>
      </FormContainer>
    </FormProvider>
  );
}

/* =========================
 *  필드 컴포넌트들
 *  (선언적으로 사용)
 * ========================= */

type BaseFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  helperText?: string;
};

/** Text / Email / Password 등 기본 인풋 */
export type TextFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
};

export function TextField<T extends FieldValues>({
  name,
  label,
  helperText,
  type = "text",
  placeholder,
}: TextFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as any;
  const message: string | undefined = error?.message;

  return (
    <FieldWrapper>
      {label && <Label htmlFor={name}>{label}</Label>}
      {helperText && <HelperText>{helperText}</HelperText>}
      <InputBase id={name} type={type} placeholder={placeholder} {...register(name)} />
      {message && <ErrorText>{message}</ErrorText>}
    </FieldWrapper>
  );
}

/** Textarea */
export type TextareaFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  placeholder?: string;
  rows?: number;
};

export function TextareaField<T extends FieldValues>({
  name,
  label,
  helperText,
  placeholder,
  rows = 4,
}: TextareaFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as any;
  const message: string | undefined = error?.message;

  return (
    <FieldWrapper>
      {label && <Label htmlFor={name}>{label}</Label>}
      {helperText && <HelperText>{helperText}</HelperText>}
      <TextareaBase
        id={name}
        placeholder={placeholder}
        rows={rows}
        {...register(name)}
      />
      {message && <ErrorText>{message}</ErrorText>}
    </FieldWrapper>
  );
}

/** Select */
export type SelectOption = {
  label: string;
  value: string;
};

export type SelectFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  options: SelectOption[];
  placeholder?: string;
};

export function SelectField<T extends FieldValues>({
  name,
  label,
  helperText,
  options,
  placeholder,
}: SelectFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as any;
  const message: string | undefined = error?.message;

  return (
    <FieldWrapper>
      {label && <Label htmlFor={name}>{label}</Label>}
      {helperText && <HelperText>{helperText}</HelperText>}
      <SelectBase id={name} {...register(name)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SelectBase>
      {message && <ErrorText>{message}</ErrorText>}
    </FieldWrapper>
  );
}

/** Checkbox */
export type CheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  children: React.ReactNode; // 레이블 텍스트
  helperText?: string;
};

export function CheckboxField<T extends FieldValues>({
  name,
  children,
  helperText,
}: CheckboxFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as any;
  const message: string | undefined = error?.message;

  return (
    <FieldWrapper>
      <CheckboxRow>
        <input type="checkbox" {...register(name)} />
        {children}
      </CheckboxRow>
      {helperText && <HelperText>{helperText}</HelperText>}
      {message && <ErrorText>{message}</ErrorText>}
    </FieldWrapper>
  );
}