module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.test.js' }]
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(js|jsx)', '**/*.(test|spec).(js|jsx)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(axios|react-icons)/)'
  ]
};
