'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useVerifyEmailMutation } from '@/hook/useAuthMutation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const verifyMutation = useVerifyEmailMutation()
  const hasCalledRef = useRef(false)

  useEffect(() => {
    if (!token || hasCalledRef.current) return
    hasCalledRef.current = true

    verifyMutation.mutateAsync(token).then(() => {
      router.push('/')
    })
  }, [token])

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-xl font-bold text-red-600">잘못된 접근입니다</h1>
        <p className="text-sm text-gray-500">인증 토큰이 없습니다.</p>
        <Link
          href="/login"
          className="text-sm text-blue-600 hover:underline"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    )
  }

  if (verifyMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600">이메일 인증 처리 중...</p>
      </div>
    )
  }

  if (verifyMutation.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-xl font-bold text-red-600">인증 실패</h1>
        <p className="text-sm text-gray-500">
          유효하지 않거나 만료된 인증 링크입니다.
        </p>
        <div className="flex gap-3 text-sm">
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h1 className="text-xl font-bold text-green-600">인증 완료!</h1>
      <p className="text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</p>
    </div>
  )
}
