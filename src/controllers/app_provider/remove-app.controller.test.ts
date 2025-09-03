import { jest } from '@jest/globals';
import RemoveApp from './remove-app.controller';
import { prisma } from '../../config/prisma';

// Mock das dependências
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
        updatedAt: new Date()
      };

      mockPrisma.app_provider.delete.mockResolvedValue(mockRemovedApp);

      // Act
      const result = await RemoveApp(mockRequest);

      // Assert
      expect(mockPrisma.app_provider.delete).toHaveBeenCalledWith({
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
      expect(mockPrisma.app_provider.delete).not.toHaveBeenCalled();
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
      expect(mockPrisma.app_provider.delete).not.toHaveBeenCalled();
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
      expect(mockPrisma.app_provider.delete).not.toHaveBeenCalled();
    });

    it('should throw error when app removal fails', async () => {
      // Arrange
      mockPrisma.app_provider.delete.mockResolvedValue(null);

      // Act & Assert
      await expect(RemoveApp(mockRequest)).rejects.toThrow(
        'Remove failed'
      );
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockPrisma.app_provider.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(RemoveApp(mockRequest)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
