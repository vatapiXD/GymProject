import { IsEnum, IsString, Length } from 'class-validator';
import { userek_rang } from '@prisma/client';
export class PasswordChangeDto {
  @IsString() @Length(1,128) currentPassword: string;
  @IsString() @Length(12,128) newPassword: string;
}
export class RoleChangeDto { @IsEnum(userek_rang) rang: userek_rang; }
