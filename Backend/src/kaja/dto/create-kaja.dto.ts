import { Type } from 'class-transformer';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	Length,
	Min,
} from 'class-validator';
import { kaja_kategoria } from 'generated/prisma/enums';

export class CreateKajaDto {
	@IsString()
	@IsNotEmpty()
	@Length(1, 100)
	nev: string;

	@IsEnum(kaja_kategoria)
	kategoria: kaja_kategoria;

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	kaloria: number;

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	feherje: number;

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	szenhidrat: number;

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	zsir: number;
}
