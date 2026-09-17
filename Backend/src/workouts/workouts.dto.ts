import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
export class StartWorkoutDto { @IsOptional() @Type(() => Number) @IsInt() @Min(1) planDayId?: number; @IsOptional() @IsString() @Length(0, 2000) note?: string; }
export class AddExerciseDto { @Type(() => Number) @IsInt() @Min(1) exerciseId!: number; @IsOptional() @Type(() => Number) @IsInt() @Min(1) sorrend?: number; @IsOptional() @IsString() @Length(0, 2000) note?: string; }
export class SetDto { @Type(() => Number) @IsInt() @Min(1) repetitions!: number; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(10000) weight?: number; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(10) rpe?: number; @IsOptional() @IsBoolean() completed?: boolean; }
