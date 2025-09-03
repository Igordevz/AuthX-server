import { jest } from '@jest/globals';
import LoginUserApp from './login.controller';
import { prisma } from '../../../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CountRequest from '../../../middleware/features/count-request';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockCountRequest = CountRequest as jest.MockedFunction<typeof CountRequest>;

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
        is_active: true
      };
      const mockToken = 'mockToken';
      const mockUpdatedUser = { ...mockUser };

      mockPrisma.admin.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockPrisma.admin.update.mockResolvedValue(mockUpdatedUser);
      mockJwt.sign.mockReturnValue(mockToken);
      mockCountRequest.mockResolvedValue(undefined);

      // Act
      const result = await LoginUserApp(mockRequest);

      // Assert
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
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
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockPrisma.admin.update).toHaveBeenCalledWith({
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
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        { expiresIn: '4d' }
      );
      expect(mockCountRequest).toHaveBeenCalledWith('app-id-123', 'LOGIN');
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
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(LoginUserApp(mockRequest)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'user@test.com',
        password_hash: 'hashedPassword'
      };

      mockPrisma.admin.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(LoginUserApp(mockRequest)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(mockPrisma.admin.update).not.toHaveBeenCalled();
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
