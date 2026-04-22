//@ts-check

 
const { composePlugins, withNx } = require('@nx/next');

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
const apiOrigin = new URL(apiUrl).origin;
const isDev = process.env.NODE_ENV !== 'production';

const connectSrc = [
  "'self'",
  apiOrigin,                                    // API 서버 (로컬이든 Elastic IP든)
  ...(isDev ? ['ws://localhost:3000'] : []),    // 개발 환경에서만 HMR WebSocket 허용
  'https://*.portone.io',
  'https://*.iamport.co',
].join(' ');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // 모노레포 패키지 transpile 설정
  transpilePackages: ['@shopping-mall/shared'],

  // 보안 헤더 설정 (CSP 포함)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.portone.io https://*.iamport.co", // Next.js 개발 서버 + 포트원 SDK
              "style-src 'self' 'unsafe-inline'", // emotion/styled-components용
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src ${connectSrc}`, // API + HMR + 포트원
              "frame-src https://*.portone.io https://*.iamport.co https://*.kakaopay.com https://*.kakao.com", // 포트원 결제창 iframe + 카카오페이
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack 설정: .js 확장자를 .ts로도 resolve + customConditions 추가
  webpack: (config, { isServer }) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };
    // 모노레포 소스 직접 참조를 위한 customConditions
    config.resolve.conditionNames = [
      '@shopping-mall/source',
      'import',
      'module',
      'require',
      'default',
    ];

    // 클라이언트 사이드에서 axios 브라우저 빌드 강제 사용
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        axios: require.resolve('axios/dist/browser/axios.cjs'),
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
        zlib: false,
      };
    }

    return config;
  },

  // 개발 환경에서 Hot Reload 개선
  ...(process.env.NODE_ENV === 'development' && {
    webpackDevMiddleware: config => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      return config
    },
  }),
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
