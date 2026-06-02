export class AuthTokensDto {
  access_token!: string;
  refresh_token!: string;
}

export class UserResponseDto {
  id!: string;
  email!: string;
}

export class AuthResponseDto {
  success!: boolean;
  description!: string;

  data!: {
    user: UserResponseDto;
    access_token: AuthTokensDto['access_token'];
    refresh_token: string;
  };
}
