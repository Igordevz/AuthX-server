// Mock do Prisma
jest.mock('../src/config/prisma', () => ({
  prisma: {
    admin: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    users_app: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    app_provider: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock do jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Mock do crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(),
  })),
}));

// Mock do middleware CountRequest
jest.mock('../src/middleware/features/count-request', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock do jwt_secret
jest.mock('../src/config/jwt', () => ({
  jwt_secret: jest.fn(() => 'mock-secret-key'),
}));

// Configuração global para testes
beforeEach(() => {
  jest.clearAllMocks();
});
