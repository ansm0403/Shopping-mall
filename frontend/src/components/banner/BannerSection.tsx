'use client'

import styled from "@emotion/styled";
import { ReactNode } from "react";

interface BannerSectionProps {
    children: ReactNode;
    backgroundImage?: string;
    backgroundColor?: string;
}

export default function BannerSection({
    children,
    backgroundImage,
    backgroundColor = '#f5f5f5'
}: BannerSectionProps) {
    return (
        <FullWidthBackground backgroundColor={backgroundColor}>
            {backgroundImage && <BlurredBackground backgroundImage={backgroundImage} />}
            <ContentContainer>
                {children}
            </ContentContainer>
        </FullWidthBackground>
    )
}

const FullWidthBackground = styled.div<{ backgroundColor: string }>`
    position: relative;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    background-color: ${props => props.backgroundColor};
    overflow: hidden;
`;

const BlurredBackground = styled.div<{ backgroundImage: string }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${props => `url(${props.backgroundImage})`};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(8px);
    z-index: 0;
`;

const ContentContainer = styled.div`
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    z-index: 1;
`;
