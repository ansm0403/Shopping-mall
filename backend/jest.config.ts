/* eslint-disable */
import { readFileSync } from 'fs';

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8')
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName: '@shopping-mall/backend',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  // 단위 테스트와 통합 테스트 분리
  // 단위 테스트만: nx test backend
  // 통합 테스트만: nx test backend --testPathPattern=integration
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '\\.integration\\.spec\\.ts$'],
};
