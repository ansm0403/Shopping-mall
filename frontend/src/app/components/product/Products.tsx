'use client'

import React, { useEffect } from 'react'
import useProducts from '../../hook/useProduct'

export default function Products() {

  const { data, isLoading, isError } = useProducts();

  useEffect(()=>{
    console.log(data);
  }, [data])

  if(isError) return <div>실패</div>

  return (
    <div>
      상품
    </div>
  )
}
