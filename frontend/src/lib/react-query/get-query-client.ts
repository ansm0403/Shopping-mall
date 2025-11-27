import { defaultShouldDehydrateQuery, isServer, QueryClient } from '@tanstack/react-query';

function createQueryClient() : QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { 
                staleTime: 60 * 1000,
            },
            dehydrate: {
                shouldDehydrateQuery: (query) =>
                    defaultShouldDehydrateQuery(query)
                || query.state.status === 'pending',
                shouldRedactErrors: () => false, 
            }
        },        
    })
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() : QueryClient {
    if(isServer) {
        return createQueryClient();
    } 
    else {
        if(!browserQueryClient) browserQueryClient = createQueryClient();
    
        return browserQueryClient;
    }
}