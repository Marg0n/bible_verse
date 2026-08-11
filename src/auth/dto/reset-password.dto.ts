import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '121314',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, { message: 'OTP must contain only digits' }) //? Optional: Enforce numeric characters only
  otp!: string;

  @ApiProperty({
    example: 'password1234',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

//* Api success response
export class ResetPasswordResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Password reset successful' })
  message!: string;
}
