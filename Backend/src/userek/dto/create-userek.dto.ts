import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { userek_cel, userek_nem } from 'generated/prisma/enums';

export class CreateUserekDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nev: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  jelszo_hash: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  suly_kg?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  magassag_cm?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  eletkor?: number;

  @IsOptional()
  @IsEnum(userek_nem)
  nem?: userek_nem;

  @IsOptional()
  @IsEnum(userek_cel)
  cel?: userek_cel;
}
