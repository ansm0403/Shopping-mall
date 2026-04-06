import { useRouter } from 'next/navigation'
import React from 'react'

export default function LogIn() {
  const router = useRouter();

  return (
    <div 
      className='text-sm text-gray-500 cursor-pointer select-none hover:text-black hover:font-bold'
      onClick={() => router.push('/login')}
    >
      로그인/회원가입
    </div>
  )
}
