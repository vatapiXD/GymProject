import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserekDto {
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  jelszo_hash: string;
}