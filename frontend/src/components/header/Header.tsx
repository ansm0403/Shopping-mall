'use client'

import React from 'react';
import Topbar from './topbar/Topbar';
import MainHeader from './mainHeader/MainHeader';
import CategoryBar from './categoryBar/CategoryBar';
import styled from '@emotion/styled'

export default function Header() {
  return (
    <HeaderContainer>
        <Topbar />
        <MainHeader />
        <CategoryBar />
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 32px;
`