import getToken from './get-token.controller';

describe('getToken Controller', () => {
  const mockRequest = {
    headers: {
      jwt: 'valid-token',
      'app-id': 'app-id-123'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should get user data successfully with valid token', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'user-id' };
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'user@test.com',
        email_verified: true,
        is_active: true,
        last_login_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        password_hash: 'hashedPassword',
        secret_key: null,
        email_verification_token: null
      };

      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.users_app.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (require('../../../middleware/features/count-request').default as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await getToken(mockRequest);

      // Assert
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(require('../../../config/prisma').prisma.users_app.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          email: true,
          email_verified: true,
          is_active: true,
          last_login_at: true,
          updatedAt: true,
          password_hash: true,
        }
      });
      expect(require('../../../middleware/features/count-request').default).toHaveBeenCalledWith('app-id-123', 'GET');
      expect(result).toEqual({
        status: 'success',
        message: 'Login successful',
        token: mockUser
      });
    });
  });

  describe('Error cases', () => {
    it('should throw error when token is invalid', async () => {
      // Arrange
      (require('jsonwebtoken').verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(getToken(mockRequest)).rejects.toThrow(
        'Invalid token'
      );
      expect(require('../../../config/prisma').prisma.users_app.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when decoded token is null', async () => {
      // Arrange
      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(null);

      // Act & Assert
      await expect(getToken(mockRequest)).rejects.toThrow(
        'Invalid token'
      );
      expect(require('../../../config/prisma').prisma.users_app.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'non-existent-user' };
      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.users_app.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(getToken(mockRequest)).rejects.toThrow(
        'User not found'
      );
    });
  });
});