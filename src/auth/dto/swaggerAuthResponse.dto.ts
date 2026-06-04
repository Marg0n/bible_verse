import { ApiProperty } from '@nestjs/swagger';

//* A dedicated DTO for the clean user structure returned during auth
export class UserResponseDto {
  @ApiProperty({ example: 'f3b3b4b5-c6d7-4e8f-9a0b-1c2d3e4f5g6h' })
  id!: string;

  @ApiProperty({ example: 'example@email.com' })
  email!: string;
}

//* A dedicated DTO for the inner payload object containing tokens and user data
class AuthPayloadDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token!: string;
}

//* Final response DTO
export class AuthResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'User logged in successfully.' })
  description!: string;

  @ApiProperty({ type: AuthPayloadDto }) //?Tells Swagger exactly how to parse this complex nested tree
  data!: AuthPayloadDto;
}
