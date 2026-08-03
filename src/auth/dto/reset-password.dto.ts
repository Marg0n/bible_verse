import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, { message: 'OTP must contain only digits' }) //? Optional: Enforce numeric characters only
  otp!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
