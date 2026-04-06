import CartIcons from '@/components/icons/CartIcons'
import React from 'react'

export default function HomeCart() {
  return (
    <div className = "flex gap-4 text-white text-sm items-center justify-center bg-sky-500 self-stretch px-7 whitespace-nowrap">
        <CartIcons size={'xl'} />
        <div>
            <div>장바구니</div>
            <div>0 ITEM - 0 원</div>
        </div>
    </div>
  )
}
