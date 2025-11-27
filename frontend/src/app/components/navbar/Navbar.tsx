'use client'

import styled from "@emotion/styled";
import Category from "./Category";
import { NavbarButton } from "./NavbarButton";

export default function Navbar() {
    return (
        <NavbarWrapper>
            <NavbarContent>
                <Logo>SHOPPING MALL</Logo>

                <Category />

                <NavbarButton>추천</NavbarButton>
                <NavbarButton>이벤트/세일</NavbarButton>

                <Spacer />

                <NavbarButton>로그인/회원가입</NavbarButton>
                <NavbarButton>장바구니</NavbarButton>
                <NavbarButton>마이쇼핑</NavbarButton>
            </NavbarContent>
        </NavbarWrapper>
    )
}

const NavbarWrapper = styled.nav`
    width: 100%;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    z-index: 100;
`;

const NavbarContent = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    opacity: 0.7;
    gap: 20px;
`;

const Logo = styled.div`
    font-size: 1.25rem;
    font-weight: bold;
    margin-right: 1rem;
`;

const Spacer = styled.div`
    flex: 1;
`;
