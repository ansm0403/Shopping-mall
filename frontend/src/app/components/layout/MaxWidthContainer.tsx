'use client'

import styled from "@emotion/styled";
import { ReactNode } from "react";

interface MaxWidthContainerProps {
    children: ReactNode;
}

export default function MaxWidthContainer({ children }: MaxWidthContainerProps) {
    return <Container>{children}</Container>
}

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
`;
