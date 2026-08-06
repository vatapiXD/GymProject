import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateEdzestervGyakorlatokDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  edzes_nap_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  gyakorlat_id: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  sorrend?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  sorozatszam?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  ismetlesszam_min?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  ismetlesszam_max?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  piheno_masodperc?: number;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  megjegyzese?: string;
}
