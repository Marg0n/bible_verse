import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

//* Api success response
export class ForgotPasswordResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'OTP sent successfully' })
  message!: string;
}
