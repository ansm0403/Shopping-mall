'use client'
import React, { useEffect, useState } from 'react';

export default function Test() {
  const [state, setState] = useState<string>();

  useEffect(() => {
    fetch('http://localhost:4000/api/sang')
      .then((data) => data.text())
      .then((data) => setState(data));
  }, []);
  return (
    <div>
    {
        state ? `나는: ${state}` : "로딩중입니다..."
    }
    </div>
  )
}
