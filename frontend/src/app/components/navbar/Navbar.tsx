'use client'

import styled from "@emotion/styled"
import Category from "./Category"

const navbarMenus = [카테고리]

export default function navbar() {
    return (
        <Navbar>
            <div>SHOPPING MALL</div>
            <Category />
            <div>검색</div>
            <div>추천</div>
            <div>이벤트/세일</div>
            <div>로그인/마이페이지</div>
            <div>장바구니</div>
        </Navbar>
    )
}

const Navbar = styled.div`
    display: flex;
    flex-direction: row;
    gap: 20px;
`

const Wrapper = styled.div`
  position: relative;
`;

const CategoryButton = styled.button`
  padding: 0.5rem 1rem; /* px-4 py-2 */
  font-weight: 500; /* font-medium */
  border-radius: 0.375rem; /* rounded-md 정도 */
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6; /* hover:bg-gray-100 */
  }
`;