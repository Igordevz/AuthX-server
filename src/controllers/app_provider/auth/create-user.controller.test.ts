import CreateUserApp from './create-user.controller';

describe('CreateUserApp Controller', () => {
  const mockRequest = {
    body: {
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123'
    },
    headers: {
      'app-id': 'app-id-123'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should create a new app user successfully', async () => {
      // Arrange
      const mockSalt = 'mockSalt';
      const mockHash = 'mockHash';
      const mockToken = 'mockToken';
      const mockCreatedUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'user@test.com',
        password_hash: mockHash,
        last_login_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        email_verified: false,
        is_active: true,
        secret_key: null,
        email_verification_token: null
      };
      const mockApp = {
        id: 'app-id-123',
        name_app: 'Test App',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test App',
        email: 'admin@test.com',
        password_hash: 'hashedPassword',
        is_active: true,
        email_verified: true,
        last_login_at: new Date(),
        limit_of_days: 30,
        role: 'ADMIN' as any
      };

      (require('bcrypt').genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (require('bcrypt').hash as jest.Mock).mockResolvedValue(mockHash);
      (require('../../../config/prisma').prisma.users_app.findUnique as jest.Mock).mockResolvedValue(null);
      (require('../../../config/prisma').prisma.users_app.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockApp);
      (require('jsonwebtoken').sign as jest.Mock).mockReturnValue(mockToken);
      (require('../../../middleware/features/count-request').default as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await CreateUserApp(mockRequest);

      // Assert
      expect(require('bcrypt').genSalt).toHaveBeenCalledWith(12);
      expect(require('bcrypt').hash).toHaveBeenCalledWith('password123', mockSalt);
      expect(require('../../../config/prisma').prisma.users_app.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@test.com' }
      });
      expect(require('../../../config/prisma').prisma.users_app.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'user@test.com',
          password_hash: mockHash,
          last_login_at: expect.any(Date),
          app_provider: {
            connect: { id: 'app-id-123' }
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          email: true,
          email_verified: true,
          is_active: true,
          last_login_at: true,
          updatedAt: true
        }
      });
      expect(require('../../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'app-id-123' }
      });
      expect(require('jsonwebtoken').sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        { expiresIn: '4d' }
      );
      expect(require('../../../middleware/features/count-request').default).toHaveBeenCalledWith('app-id-123', 'CREATE');
      expect(result).toEqual({
        status: 'success',
        message: 'User created successfully',
        token: mockToken
      });
    });
  });

  describe('Error cases', () => {
    it('should throw error when user already exists', async () => {
      // Arrange
      const existingUser = {
        id: 'existing-id',
        email: 'user@test.com',
        name: 'Existing User',
        createdAt: new Date(),
        updatedAt: new Date(),
        password_hash: 'hashedPassword',
        is_active: true,
        email_verified: true,
        last_login_at: new Date(),
        secret_key: null,
        email_verification_token: null
      };

      (require('../../../config/prisma').prisma.users_app.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(CreateUserApp(mockRequest)).rejects.toThrow(
        'User already exists with this email'
      );
      expect(require('../../../config/prisma').prisma.users_app.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        },
        headers: {
          'app-id': 'app-id-123'
        }
      } as any;

      // Act & Assert
      await expect(CreateUserApp(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for short password', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          name: 'Test User',
          email: 'user@test.com',
          password: '123'
        },
        headers: {
          'app-id': 'app-id-123'
        }
      } as any;

      // Act & Assert
      await expect(CreateUserApp(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for missing name', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          email: 'user@test.com',
          password: 'password123'
        },
        headers: {
          'app-id': 'app-id-123'
        }
      } as any;

      // Act & Assert
      await expect(CreateUserApp(invalidRequest)).rejects.toThrow();
    });
  });
});