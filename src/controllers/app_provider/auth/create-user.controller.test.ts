import { jest } from '@jest/globals';
import CreateUserApp from './create-user.controller';
import { prisma } from '../../../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CountRequest from '../../../middleware/features/count-request';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockCountRequest = CountRequest as jest.MockedFunction<typeof CountRequest>;

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
        is_active: true
      };
      const mockApp = {
        id: 'app-id-123',
        name_app: 'Test App'
      };

      mockBcrypt.genSalt.mockResolvedValue(mockSalt);
      mockBcrypt.hash.mockResolvedValue(mockHash);
      mockPrisma.users_app.findUnique.mockResolvedValue(null);
      mockPrisma.users_app.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.admin.findUnique.mockResolvedValue(mockApp);
      mockJwt.sign.mockReturnValue(mockToken);
      mockCountRequest.mockResolvedValue(undefined);

      // Act
      const result = await CreateUserApp(mockRequest);

      // Assert
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', mockSalt);
      expect(mockPrisma.users_app.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@test.com' }
      });
      expect(mockPrisma.users_app.create).toHaveBeenCalledWith({
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
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'app-id-123' }
      });
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        { expiresIn: '4d' }
      );
      expect(mockCountRequest).toHaveBeenCalledWith('app-id-123', 'CREATE');
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
        name: 'Existing User'
      };

      mockPrisma.users_app.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(CreateUserApp(mockRequest)).rejects.toThrow(
        'User already exists with this email'
      );
      expect(mockPrisma.users_app.create).not.toHaveBeenCalled();
    });

    it('should throw error when user creation fails', async () => {
      // Arrange
      mockBcrypt.genSalt.mockResolvedValue('mockSalt');
      mockBcrypt.hash.mockResolvedValue('mockHash');
      mockPrisma.users_app.findUnique.mockResolvedValue(null);
      mockPrisma.users_app.create.mockResolvedValue(null);

      // Act & Assert
      await expect(CreateUserApp(mockRequest)).rejects.toThrow(
        'Failed to create user'
      );
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
