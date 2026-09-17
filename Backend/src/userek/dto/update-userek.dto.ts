import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { userek_cel, userek_nem } from '@prisma/client';
class ProfileDto {
  @IsString() @Length(1,100) nev: string;
  @IsOptional() @IsNumber() @Min(20) @Max(500) suly_kg?: number;
  @IsOptional() @IsInt() @Min(50) @Max(260) magassag_cm?: number;
  @IsOptional() @IsInt() @Min(13) @Max(120) eletkor?: number;
  @IsOptional() @IsEnum(userek_nem) nem?: userek_nem;
  @IsOptional() @IsEnum(userek_cel) cel?: userek_cel;
}
export class UpdateUserekDto extends PartialType(ProfileDto) {}
