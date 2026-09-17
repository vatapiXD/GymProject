import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
export class CreateShareDto { @Type(() => Number) @IsInt() @Min(1) planId!: number; @Type(() => Number) @IsInt() @Min(1) recipientId!: number; @IsOptional() @IsString() @Length(0, 500) message?: string; }
export class SearchUsersDto { @IsString() @Length(2, 40) query!: string; }
