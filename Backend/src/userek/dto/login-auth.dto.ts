import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  jelszo: string;
}