'use client'

import { ReactNode } from "react";

interface MaxWidthContainerProps {
    children: ReactNode;
}

export default function MaxWidthContainer({ children }: MaxWidthContainerProps) {
    return (
        <div className="max-w-[1200px] mx-auto px-4 w-full">
            {children}
        </div>
    );
}
