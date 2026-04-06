import React from 'react'
import UserMenu from './UserMenu';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const router = useRouter();

  return (
    <div className='max-w-[1200px] flex justify-between'>
        <div className='cursor-pointer select-none' onClick={() => router.push('/')}>Welcome to <span className='text-sky-300 font-bold'>Shopping mall</span> !!</div>
        <UserMenu />
    </div>
  )
}
