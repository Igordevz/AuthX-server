import { jest } from '@jest/globals';
import GetTokenAdmin from './get-token-admin.controller';
import { prisma } from '../../../config/prisma';
import jwt from 'jsonwebtoken';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

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
        app_providers: [
          {
            id: 'app-id',
            name_app: 'Test App',
            public_key: 'public-key',
            createdAt: new Date()
          }
        ]
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.admin.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await GetTokenAdmin(mockRequest);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
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
      expect(mockJwt.verify).not.toHaveBeenCalled();
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
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    it('should throw error when token is invalid or expired', async () => {
      // Arrange
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(GetTokenAdmin(mockRequest)).rejects.toThrow(
        'Invalid or expired token'
      );
      expect(mockPrisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'non-existent-user' };
      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(GetTokenAdmin(mockRequest)).rejects.toThrow(
        'User not found'
      );
    });
  });
});
