'use client'

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
        <div
            className="relative w-screen ml-[calc(-50vw_+_50%)] mr-[calc(-50vw_+_50%)] overflow-hidden"
            style={{ backgroundColor }}
        >
            {backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[8px] z-0"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
            )}
            <div className="relative max-w-[1200px] mx-auto px-4 z-[1]">
                {children}
            </div>
        </div>
    );
}
