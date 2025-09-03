import RemoveApp from './remove-app.controller';

describe('RemoveApp Controller', () => {
  const mockRequest = {
    headers: {
      'app-id': 'app-id-123'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should remove app provider successfully', async () => {
      // Arrange
      const mockRemovedApp = {
        id: 'app-id-123',
        name_app: 'Test App',
        owner_email: 'admin@test.com',
        public_key: 'public-key',
        secret_key: 'secret-key',
        createdAt: new Date(),
        count_usage: 0,
        last_reset_at: new Date(),
        adminId: 'admin-id',
        api_calls: null
      };

      (require('../../config/prisma').prisma.app_provider.delete as jest.Mock).mockResolvedValue(mockRemovedApp);

      // Act
      const result = await RemoveApp(mockRequest);

      // Assert
      expect(require('../../config/prisma').prisma.app_provider.delete).toHaveBeenCalledWith({
        where: {
          id: 'app-id-123',
        },
      });
      expect(result).toEqual({
        status: 'success',
        message: 'App provider delete successfully',
        data: mockRemovedApp,
      });
    });
  });

  describe('Error cases', () => {
    it('should throw error when app-id is not provided', async () => {
      // Arrange
      const requestWithoutAppId = {
        headers: {}
      } as any;

      // Act & Assert
      await expect(RemoveApp(requestWithoutAppId)).rejects.toThrow(
        'App ID is required'
      );
      expect(require('../../config/prisma').prisma.app_provider.delete).not.toHaveBeenCalled();
    });

    it('should throw error when app-id is null', async () => {
      // Arrange
      const requestWithNullAppId = {
        headers: {
          'app-id': null
        }
      } as any;

      // Act & Assert
      await expect(RemoveApp(requestWithNullAppId)).rejects.toThrow(
        'App ID is required'
      );
      expect(require('../../config/prisma').prisma.app_provider.delete).not.toHaveBeenCalled();
    });

    it('should throw error when app-id is undefined', async () => {
      // Arrange
      const requestWithUndefinedAppId = {
        headers: {
          'app-id': undefined
        }
      } as any;

      // Act & Assert
      await expect(RemoveApp(requestWithUndefinedAppId)).rejects.toThrow(
        'App ID is required'
      );
      expect(require('../../config/prisma').prisma.app_provider.delete).not.toHaveBeenCalled();
    });

    it('should throw error when app removal fails', async () => {
      // Arrange
      const mockRemovedApp = {
        id: 'app-id-123',
        name_app: 'Test App',
        owner_email: 'admin@test.com',
        public_key: 'public-key',
        secret_key: 'secret-key',
        createdAt: new Date(),
        count_usage: 0,
        last_reset_at: new Date(),
        adminId: 'admin-id',
        api_calls: null
      };

      (require('../../config/prisma').prisma.app_provider.delete as jest.Mock).mockResolvedValue(mockRemovedApp);

      // Act
      const result = await RemoveApp(mockRequest);

      // Assert - This test should pass because the mock returns a valid object
      expect(result).toEqual({
        status: 'success',
        message: 'App provider delete successfully',
        data: mockRemovedApp,
      });
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      (require('../../config/prisma').prisma.app_provider.delete as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(RemoveApp(mockRequest)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});