'use client'

import { ReactNode } from "react";

interface MaxWidthContainerProps {
    children: ReactNode;
}

export default function MaxWidthContainer({ children }: MaxWidthContainerProps) {
    return (
        <div className="relative max-w-[1200px] mx-auto px-4 w-full z-[100]">
            {children}
        </div>
    );
}
