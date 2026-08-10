import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateEdzestervekDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nev: string;

  @IsOptional()
  @IsString()
  leiras?: string;

  @IsOptional()
  @IsBoolean()
  aktiv?: boolean;

  @IsOptional()
  @IsBoolean()
  publikus?: boolean;
}
