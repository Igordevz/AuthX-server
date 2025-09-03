import { jest } from '@jest/globals';
import LoginAdmin from './login-admin.controller';
import { prisma } from '../../../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

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
        is_active: true
      };
      const mockToken = 'mockToken';
      const mockUpdatedUser = { ...mockUser };

      mockPrisma.admin.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockPrisma.admin.update.mockResolvedValue(mockUpdatedUser);
      mockJwt.sign.mockReturnValue(mockToken);

      // Act
      const result = await LoginAdmin(mockRequest);

      // Assert
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
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
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockPrisma.admin.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { last_login_at: expect.any(Date) }
      });
      expect(mockJwt.sign).toHaveBeenCalledWith(
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
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(LoginAdmin(mockRequest)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'admin@test.com',
        password_hash: 'hashedPassword'
      };

      mockPrisma.admin.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(LoginAdmin(mockRequest)).rejects.toThrow(
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
