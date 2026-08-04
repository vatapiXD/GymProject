import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateIzomcsoportokDto {
	@IsString()
	@IsNotEmpty()
	@Length(1, 50)
	nev: string;
}
