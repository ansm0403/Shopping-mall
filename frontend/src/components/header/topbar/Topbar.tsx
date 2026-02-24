'use client'

import React from 'react'
import styled from "@emotion/styled";
import UserMenu from './UserMenu';

export default function Topbar() {
  return (
    <Container>
        <div>Welcome to <span style = {{color : "orange", fontWeight: "bold"}}>Shopping mall</span> !!</div>
        <UserMenu />
    </Container>
  )
}

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
`