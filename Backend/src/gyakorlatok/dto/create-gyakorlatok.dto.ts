import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateGyakorlatokDto {
	@IsString()
	@IsNotEmpty()
	@Length(1, 100)
	nev: string;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	elsodleges_izomcsoport_id: number;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	masodlagos_izomcsoport_id?: number;
}
