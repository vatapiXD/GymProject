import { IsEmail, IsString, Length, Matches } from 'class-validator';
export class RegisterAuthDto {
  @IsString() @Length(1, 100) nev!: string;
  @IsString() @Length(3, 40) @Matches(/^[a-zA-Z0-9_]+$/) username!: string;
  @IsEmail() @Length(1, 150) email!: string;
  @IsString() @Length(12, 128) jelszo!: string;
}
