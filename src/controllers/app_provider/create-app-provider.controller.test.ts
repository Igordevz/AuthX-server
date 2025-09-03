import { jest } from '@jest/globals';
import CreateAppProvider from './create-app-provider.controller';
import { prisma } from '../../config/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;

describe('CreateAppProvider Controller', () => {
  const mockRequest = {
    body: {
      name_app: 'Test App'
    },
    headers: {
      jwt: 'valid-token'
    }
  } as any;

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should create app provider successfully', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'admin-id' };
      const mockAdmin = {
        id: 'admin-id',
        name: 'Test Admin',
        email: 'admin@test.com'
      };
      const mockRawSecret = 'rawSecret123';
      const mockSecretKey = 'sk_rawSecret123';
      const mockPublicKey = 'hashedPublicKey';
      const mockCreatedApp = {
        id: 'app-id',
        name_app: 'Test App',
        owner_email: 'admin@test.com',
        public_key: mockPublicKey,
        secret_key: mockSecretKey,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
      mockCrypto.randomBytes.mockReturnValue(Buffer.from(mockRawSecret));
      mockCrypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockPublicKey)
      } as any);
      mockPrisma.app_provider.create.mockResolvedValue(mockCreatedApp);

      // Act
      await CreateAppProvider(mockRequest, mockReply);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-id' }
      });
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockPrisma.app_provider.create).toHaveBeenCalledWith({
        data: {
          name_app: 'Test App',
          owner_email: 'admin@test.com',
          public_key: mockPublicKey,
          secret_key: mockSecretKey,
          admin: { connect: { id: 'admin-id' } },
        },
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        status: 'success',
        message: 'App provider created successfully',
        data: mockCreatedApp,
      });
    });
  });

  describe('Error cases', () => {
    it('should return 400 when body is missing', async () => {
      // Arrange
      const requestWithoutBody = {
        headers: {
          jwt: 'valid-token'
        }
      } as any;

      // Act
      await CreateAppProvider(requestWithoutBody, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Body is required' });
    });

    it('should return 400 when jwt is missing', async () => {
      // Arrange
      const requestWithoutJwt = {
        body: {
          name_app: 'Test App'
        },
        headers: {}
      } as any;

      // Act
      await CreateAppProvider(requestWithoutJwt, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Missing or invalid jwt in headers' });
    });

    it('should return 401 when token is invalid', async () => {
      // Arrange
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await CreateAppProvider(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });

    it('should return 404 when admin is not found', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'non-existent-admin' };
      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      // Act
      await CreateAppProvider(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Admin not found' });
    });

    it('should return 500 when app creation fails', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'admin-id' };
      const mockAdmin = {
        id: 'admin-id',
        name: 'Test Admin',
        email: 'admin@test.com'
      };
      const mockError = new Error('Database error');

      mockJwt.verify.mockReturnValue(mockDecodedToken);
      mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
      mockCrypto.randomBytes.mockReturnValue(Buffer.from('rawSecret123'));
      mockCrypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedPublicKey')
      } as any);
      mockPrisma.app_provider.create.mockRejectedValue(mockError);

      // Act
      await CreateAppProvider(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create app provider',
        details: 'Database error',
      });
    });

    it('should throw error for invalid app name', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          name_app: ''
        },
        headers: {
          jwt: 'valid-token'
        }
      } as any;

      // Act
      await CreateAppProvider(invalidRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
    });
  });
});
