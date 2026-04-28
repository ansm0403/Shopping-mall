import { LoginForm } from '@/components/forms/LoginForm'
import React, { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
