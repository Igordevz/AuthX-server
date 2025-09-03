import GetTokenAdmin from './get-token-admin.controller';

describe('GetTokenAdmin Controller', () => {
  const mockRequest = {
    headers: {
      jwt: 'valid-token'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should get admin user data successfully with valid token', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'user-id' };
      const mockUser = {
        id: 'user-id',
        name: 'Test Admin',
        email: 'admin@test.com',
        email_verified: true,
        is_active: true,
        last_login_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        password_hash: 'hashedPassword',
        limit_of_days: 30,
        role: 'ADMIN' as any,
        app_providers: [
          {
            id: 'app-id',
            name_app: 'Test App',
            public_key: 'public-key',
            createdAt: new Date()
          }
        ]
      };

      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await GetTokenAdmin(mockRequest);

      // Assert
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(require('../../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          name: true,
          email: true,
          email_verified: true,
          is_active: true,
          last_login_at: true,
          createdAt: true,
          updatedAt: true,
          app_providers: {
            select: {
              id: true,
              name_app: true,
              public_key: true,
              createdAt: true,
            },
          },
        }
      });
      expect(result).toEqual({
        status: 'success',
        message: 'Login successful',
        data: mockUser
      });
    });
  });

  describe('Error cases', () => {
    it('should throw error when token is not provided', async () => {
      // Arrange
      const requestWithoutToken = {
        headers: {}
      } as any;

      // Act & Assert
      await expect(GetTokenAdmin(requestWithoutToken)).rejects.toThrow(
        'Token not provided or invalid'
      );
      expect(require('jsonwebtoken').verify).not.toHaveBeenCalled();
    });

    it('should throw error when token is not a string', async () => {
      // Arrange
      const requestWithInvalidToken = {
        headers: {
          jwt: 123
        }
      } as any;

      // Act & Assert
      await expect(GetTokenAdmin(requestWithInvalidToken)).rejects.toThrow(
        'Token not provided or invalid'
      );
      expect(require('jsonwebtoken').verify).not.toHaveBeenCalled();
    });

    it('should throw error when token is invalid or expired', async () => {
      // Arrange
      (require('jsonwebtoken').verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(GetTokenAdmin(mockRequest)).rejects.toThrow(
        'Invalid or expired token'
      );
      expect(require('../../../config/prisma').prisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'non-existent-user' };
      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(GetTokenAdmin(mockRequest)).rejects.toThrow(
        'User not found'
      );
    });
  });
});