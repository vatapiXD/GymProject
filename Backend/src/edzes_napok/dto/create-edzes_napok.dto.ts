import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateEdzesNapokDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  edzesterv_id: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nev: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  sorrend?: number;
}
