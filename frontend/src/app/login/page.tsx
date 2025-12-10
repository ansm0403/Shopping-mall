'use client'

import { LoginForm } from '../../../src/components/forms/LoginForm'
import React from 'react'
import styled from "@emotion/styled";

export default function LoginPage() {
  return (
    <LoginFormContainer>
      <LoginForm />
    </LoginFormContainer>
  )
}

const LoginFormContainer = styled.div`
  items-align:center;
`
