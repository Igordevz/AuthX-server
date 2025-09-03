import { jest } from '@jest/globals';
import getToken from './get-token.controller';
import { prisma } from '../../../config/prisma';
import jwt from 'jsonwebtoken';
import CountRequest from '../../../middleware/features/count-request';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockCountRequest = CountRequest as jest.MockedFunction<typeof CountRequest>;

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
        password_hash: 'hashedPassword'
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.users_app.findUnique.mockResolvedValue(mockUser);
      mockCountRequest.mockResolvedValue(undefined);

      // Act
      const result = await getToken(mockRequest);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(mockPrisma.users_app.findUnique).toHaveBeenCalledWith({
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
      expect(mockCountRequest).toHaveBeenCalledWith('app-id-123', 'GET');
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
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(getToken(mockRequest)).rejects.toThrow(
        'Invalid token'
      );
      expect(mockPrisma.users_app.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when decoded token is null', async () => {
      // Arrange
      mockJwt.verify.mockReturnValue(null);

      // Act & Assert
      await expect(getToken(mockRequest)).rejects.toThrow(
        'Invalid token'
      );
      expect(mockPrisma.users_app.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'non-existent-user' };
      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.users_app.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(getToken(mockRequest)).rejects.toThrow(
        'User not found'
      );
    });
  });
});
