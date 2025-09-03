import CreateAppProvider from './create-app-provider.controller';

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
        email: 'admin@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        password_hash: 'hashedPassword',
        is_active: true,
        email_verified: true,
        last_login_at: new Date(),
        limit_of_days: 30,
        role: 'ADMIN' as any
      };
      const mockRawSecret = 'rawSecret123';
      const mockSecretKey = 'sk_726177536563726574313233'; // This is the actual hex representation
      const mockPublicKey = 'hashedPublicKey';
      const mockCreatedApp = {
        id: 'app-id',
        name_app: 'Test App',
        owner_email: 'admin@test.com',
        public_key: mockPublicKey,
        secret_key: mockSecretKey,
        createdAt: new Date(),
        count_usage: 0,
        last_reset_at: new Date(),
        adminId: 'admin-id',
        api_calls: null
      };

      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (require('crypto').randomBytes as jest.Mock).mockReturnValue(Buffer.from(mockRawSecret));
      (require('crypto').createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockPublicKey)
      });
      (require('../../config/prisma').prisma.app_provider.create as jest.Mock).mockResolvedValue(mockCreatedApp);

      // Act
      await CreateAppProvider(mockRequest, mockReply);

      // Assert
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(require('../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-id' }
      });
      expect(require('crypto').randomBytes).toHaveBeenCalledWith(32);
      expect(require('../../config/prisma').prisma.app_provider.create).toHaveBeenCalledWith({
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
      (require('jsonwebtoken').verify as jest.Mock).mockImplementation(() => {
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
      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      await CreateAppProvider(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Admin not found' });
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

      // Act & Assert
      await expect(CreateAppProvider(invalidRequest, mockReply)).rejects.toThrow();
    });
  });
});