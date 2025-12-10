'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { getQueryClient } from '../lib/react-query/get-query-client'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

export default function ReactQueryProvider({
    children
}: {
    children : React.ReactNode
}) {

    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryStreamedHydration>
                {children}
            </ReactQueryStreamedHydration>
        </QueryClientProvider>
    )
}
