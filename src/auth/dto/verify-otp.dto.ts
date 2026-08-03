import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, { message: 'OTP must contain only digits' }) //? Optional: Enforce numeric characters only
  otp!: string;
}
