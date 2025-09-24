// Test setup file
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.RATE_LIMIT_MAX_REQUESTS = '10000'; // Disable rate limiting for tests
process.env.ENABLE_GEMINI = 'false'; // Disable AI engines for faster tests

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
