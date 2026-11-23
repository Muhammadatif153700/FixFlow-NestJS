import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 80)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 72)
  @Matches(/(?=.*[a-zA-Z])(?=.*[0-9])/, { message: 'Password must contain at least one letter and one number' })
  password: string;
}