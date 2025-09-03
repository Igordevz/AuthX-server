import LoginUserApp from './login.controller';

describe('LoginUserApp Controller', () => {
  const mockRequest = {
    body: {
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
    it('should login app user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'user@test.com',
        password_hash: 'hashedPassword',
        last_login_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        email_verified: true,
        is_active: true,
        limit_of_days: 30,
        role: 'ADMIN' as any
      };
      const mockToken = 'mockToken';
      const mockUpdatedUser = { ...mockUser };

      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(true);
      (require('../../../config/prisma').prisma.admin.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (require('jsonwebtoken').sign as jest.Mock).mockReturnValue(mockToken);
      (require('../../../middleware/features/count-request').default as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await LoginUserApp(mockRequest);

      // Assert
      expect(require('../../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          email: true,
          email_verified: true,
          is_active: true,
          last_login_at: true,
          updatedAt: true,
          password_hash: true
        }
      });
      expect(require('bcrypt').compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(require('../../../config/prisma').prisma.admin.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          last_login_at: expect.any(Date),
          app_providers: {
            connect: {
              id: 'app-id-123'
            }
          }
        }
      });
      expect(require('jsonwebtoken').sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        { expiresIn: '4d' }
      );
      expect(require('../../../middleware/features/count-request').default).toHaveBeenCalledWith('app-id-123', 'LOGIN');
      expect(result).toEqual({
        status: 'success',
        message: 'Login successful',
        token: mockToken
      });
    });
  });

  describe('Error cases', () => {
    it('should throw error when user is not found', async () => {
      // Arrange
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(LoginUserApp(mockRequest)).rejects.toThrow(
        'Invalid email or password'
      );
      // Note: bcrypt.compare might still be called with undefined password_hash
    });

    it('should throw error when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'user@test.com',
        password_hash: 'hashedPassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        is_active: true,
        email_verified: true,
        last_login_at: new Date(),
        limit_of_days: 30,
        role: 'ADMIN' as any
      };

      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(LoginUserApp(mockRequest)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(require('../../../config/prisma').prisma.admin.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          email: 'invalid-email',
          password: 'password123'
        },
        headers: {
          'app-id': 'app-id-123'
        }
      } as any;

      // Act & Assert
      await expect(LoginUserApp(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for short password', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          email: 'user@test.com',
          password: '123'
        },
        headers: {
          'app-id': 'app-id-123'
        }
      } as any;

      // Act & Assert
      await expect(LoginUserApp(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for missing email', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          password: 'password123'
        },
        headers: {
          'app-id': 'app-id-123'
        }
      } as any;

      // Act & Assert
      await expect(LoginUserApp(invalidRequest)).rejects.toThrow();
    });
  });
});