import CreateUserAdmin from './create-admin.controller';

describe('CreateUserAdmin Controller', () => {
  const mockRequest = {
    body: {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123'
    }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should create a new admin user successfully', async () => {
      // Arrange
      const mockSalt = 'mockSalt';
      const mockHash = 'mockHash';
      const mockToken = 'mockToken';
      const mockCreatedUser = {
        id: 'user-id',
        name: 'Test Admin',
        email: 'admin@test.com',
        password_hash: mockHash,
        last_login_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        email_verified: false,
        is_active: true,
        limit_of_days: 30,
        role: 'ADMIN' as any
      };

      (require('bcrypt').genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (require('bcrypt').hash as jest.Mock).mockResolvedValue(mockHash);
      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      (require('../../../config/prisma').prisma.admin.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (require('jsonwebtoken').sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await CreateUserAdmin(mockRequest);

      // Assert
      expect(require('bcrypt').genSalt).toHaveBeenCalledWith(12);
      expect(require('bcrypt').hash).toHaveBeenCalledWith('password123', mockSalt);
      expect(require('../../../config/prisma').prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' }
      });
      expect(require('../../../config/prisma').prisma.admin.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Admin',
          email: 'admin@test.com',
          password_hash: mockHash,
          last_login_at: expect.any(Date)
        }
      });
      expect(require('jsonwebtoken').sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        { expiresIn: '4d' }
      );
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
        email: 'admin@test.com',
        name: 'Existing Admin'
      };

      (require('../../../config/prisma').prisma.admin.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(CreateUserAdmin(mockRequest)).rejects.toThrow(
        'User already exists with this email'
      );
      expect(require('../../../config/prisma').prisma.admin.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          name: 'Test Admin',
          email: 'invalid-email',
          password: 'password123'
        }
      } as any;

      // Act & Assert
      await expect(CreateUserAdmin(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for short password', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          name: 'Test Admin',
          email: 'admin@test.com',
          password: '123'
        }
      } as any;

      // Act & Assert
      await expect(CreateUserAdmin(invalidRequest)).rejects.toThrow();
    });

    it('should throw error for missing name', async () => {
      // Arrange
      const invalidRequest = {
        body: {
          email: 'admin@test.com',
          password: 'password123'
        }
      } as any;

      // Act & Assert
      await expect(CreateUserAdmin(invalidRequest)).rejects.toThrow();
    });
  });
});