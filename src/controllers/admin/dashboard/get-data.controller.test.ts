import GetDashboardData from './get-data.controller';

describe('GetDashboardData Controller', () => {
  const mockRequest = {
    headers: {
      jwt: 'valid-token'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should get dashboard data successfully', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'admin-id' };
      const mockAdminData = {
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
        role: 'ADMIN' as any,
        app_providers: [
          {
            id: 'app-1',
            name_app: 'App 1',
            api_calls: 100,
            count_usage: 10,
            users: [
              { id: 'user-1', email_verified: true },
              { id: 'user-2', email_verified: false }
            ]
          },
          {
            id: 'app-2',
            name_app: 'App 2',
            api_calls: 200,
            count_usage: 20,
            users: [
              { id: 'user-3', email_verified: true },
              { id: 'user-4', email_verified: true }
            ]
          }
        ]
      };

      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdminData);

      // Act
      const result = await GetDashboardData(mockRequest);

      // Assert
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(require('../../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-id' },
        include: {
          app_providers: {
            include: {
              users: true,
            },
          },
        },
      });

      expect(result).toEqual({
        metrics: {
          active_projects: 2,
          total_users: 4,
          total_api_usage: 300,
          usage_today: 30,
        },
        charts: {
          api_usage_by_app: [
            { name_app: 'App 1', api_calls: 100 },
            { name_app: 'App 2', api_calls: 200 }
          ],
          users_by_app: [
            { name_app: 'App 1', total_users: 2 },
            { name_app: 'App 2', total_users: 2 }
          ],
          email_verification: {
            verified: 3,
            unverified: 1,
          },
        },
      });
    });

    it('should handle empty app providers', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'admin-id' };
      const mockAdminData = {
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
        role: 'ADMIN' as any,
        app_providers: []
      };

      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdminData);

      // Act
      const result = await GetDashboardData(mockRequest);

      // Assert
      expect(result).toEqual({
        metrics: {
          active_projects: 0,
          total_users: 0,
          total_api_usage: 0,
          usage_today: 0,
        },
        charts: {
          api_usage_by_app: [],
          users_by_app: [],
          email_verification: {
            verified: 0,
            unverified: 0,
          },
        },
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
      await expect(GetDashboardData(requestWithoutToken)).rejects.toThrow(
        'Token not provided or invalid'
      );
      expect(require('jsonwebtoken').verify).not.toHaveBeenCalled();
    });

    it('should throw error when token is invalid or expired', async () => {
      // Arrange
      (require('jsonwebtoken').verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(GetDashboardData(mockRequest)).rejects.toThrow(
        'Invalid or expired token'
      );
      expect(require('../../../config/prisma').prisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when admin is not found', async () => {
      // Arrange
      const mockDecodedToken = { userId: 'non-existent-admin' };
      (require('jsonwebtoken').verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(GetDashboardData(mockRequest)).rejects.toThrow(
        'Admin not found'
      );
    });
  });
});