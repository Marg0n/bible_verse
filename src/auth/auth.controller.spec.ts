import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  // let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            forgotPassword: jest.fn(),
            verifyOtp: jest.fn(),
            resetPassword: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    // authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should call authService.login on login request', async () => {
  //   const loginDto = { email: 'test@test.com', password: 'password123' };

  //   // Tell the mock what to return when login is called
  //   jest
  //     .spyOn(authService, 'login')
  //     .mockResolvedValue({ access_token: 'mock-token' });

  //   const result = await controller.login(loginDto);

  //   // Verify the mock was called with the right data
  //   expect(authService.login).toHaveBeenCalledWith(loginDto);
  //   expect(result).toEqual({ access_token: 'mock-token' });
  // });
});
