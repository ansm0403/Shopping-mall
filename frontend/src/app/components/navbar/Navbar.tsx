'use client'

import styled from "@emotion/styled";
import Category from "./Category";
import { NavbarButton } from "./NavbarButton";

export default function Navbar() {
    return (
        <NavbarContainer>
            <Logo>SHOPPING MALL</Logo>

            <Category />

            <NavbarButton>추천</NavbarButton>
            <NavbarButton>이벤트/세일</NavbarButton>

            <Spacer />

            <NavbarButton>로그인/회원가입</NavbarButton>
            <NavbarButton>장바구니</NavbarButton>
            <NavbarButton>마이쇼핑</NavbarButton>
        </NavbarContainer>
    )
}

const NavbarContainer = styled.nav`
    display: flex;
    flex-direction: row;
    align-items: center;
    opacity: 0.7;
    gap: 20px;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
`;

const Logo = styled.div`
    font-size: 1.25rem;
    font-weight: bold;
    margin-right: 1rem;
`;

const Spacer = styled.div`
    flex: 1;
`;
