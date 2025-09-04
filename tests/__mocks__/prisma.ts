export const prisma = {
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
};


