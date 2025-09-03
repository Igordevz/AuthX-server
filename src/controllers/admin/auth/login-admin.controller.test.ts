import LoginAdmin from './login-admin.controller';

describe('LoginAdmin Controller', () => {
  const mockRequest = {
    body: {
      email: 'admin@test.com',
      password: 'password123'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should login admin user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        name: 'Test Admin',
        email: 'admin@test.com',
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

      // Act
      const result = await LoginAdmin(mockRequest);

      // Assert
      expect(require('../../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
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
        data: { last_login_at: expect.any(Date) }
      });
      expect(require('jsonwebtoken').sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        { expiresIn: '4d' }
      );
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
      await expect(LoginAdmin(mockRequest)).rejects.toThrow(
        'Invalid email or password'
      );
      // Note: bcrypt.compare might still be called with undefined password_hash
    });

    it('should throw error when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'admin@test.com',
        password_hash: 'hashedPassword',
        name: 'Test Admin',
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
      await expect(LoginAdmin(mockRequest)).rejects.toThrow(
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
        }
      } as any;

      // Act & Assert
      await expect(LoginAdmin(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for short password', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          email: 'admin@test.com',
          password: '123'
        }
      } as any;

      // Act & Assert
      await expect(LoginAdmin(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for missing email', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          password: 'password123'
        }
      } as any;

      // Act & Assert
      await expect(LoginAdmin(invalidRequest)).rejects.toThrow();
    });
  });
});