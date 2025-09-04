process.env.NODE_ENV = 'test';
process.env.JWT_KEY = process.env.JWT_KEY || 'test-secret';

afterEach(() => {
	jest.clearAllMocks();
});

// Mock core libs used in tests
jest.mock('jsonwebtoken', () => ({
	verify: jest.fn(),
	sign: jest.fn(),
}));

jest.mock('bcrypt', () => ({
	genSalt: jest.fn(),
	hash: jest.fn(),
	compare: jest.fn(),
}));

jest.mock('crypto', () => ({
	randomBytes: jest.fn(),
	createHash: jest.fn(),
}));

// Mock app modules by absolute path so all relative imports resolve to this mock
// Paths used across tests (different relative depths)
jest.mock('../../config/prisma', () => ({
	prisma: {
		admin: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		users_app: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		app_provider: {
			delete: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
		},
	},
}));

jest.mock('../../../config/prisma', () => ({
	prisma: {
		admin: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		users_app: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		app_provider: {
			delete: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
		},
	},
}));

jest.mock('../../middleware/features/count-request', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('../../../middleware/features/count-request', () => ({
	__esModule: true,
	default: jest.fn(),
}));


