import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator';

export class PlanExerciseDto {
  @Type(() => Number) @IsInt() @Min(1) gyakorlat_id!: number;
  @Type(() => Number) @IsInt() @Min(1) sorrend!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) sorozatszam!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(1000) ismetlesszam_min!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(1000) ismetlesszam_max!: number;
  @Type(() => Number) @IsInt() @Min(0) @Max(7200) piheno_masodperc!: number;
  @IsOptional() @IsString() @Length(0, 2000) megjegyzese?: string;
}
export class PlanDayDto {
  @IsString() @IsNotEmpty() @Length(1, 100) nev!: string;
  @Type(() => Number) @IsInt() @Min(1) sorrend!: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PlanExerciseDto) gyakorlatok!: PlanExerciseDto[];
}
export class SavePlanDto {
  @IsString() @IsNotEmpty() @Length(1, 100) nev!: string;
  @IsOptional() @IsString() @Length(0, 5000) leiras?: string;
  @IsOptional() @IsBoolean() aktiv?: boolean;
  @IsOptional() @IsBoolean() publikus?: boolean;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PlanDayDto) napok!: PlanDayDto[];
}
