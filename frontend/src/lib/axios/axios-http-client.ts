import axios from 'axios';

const baseConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 5000,
    headers: { "Content-Type" : "application/json" },
};

// 공개 API용 클라이언트 (인증 불필요)
export const publicClient = axios.create(baseConfig);

publicClient.interceptors.request.use(
    (config) => {
        console.log("[Public API] 요청 전 : ", config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 인증 필요 API용 클라이언트
export const authClient = axios.create(baseConfig);

authClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if(token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log("[Auth API] 요청 전 : ", config.url);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 하위 호환성을 위한 기본 export (기존 코드와의 호환)
// 점진적 마이그레이션을 위해 authClient를 기본으로 사용
export const httpClient = authClient;