import { PartialType } from '@nestjs/mapped-types';
import { CreateEdzesNapokDto } from './create-edzes_napok.dto';

export class UpdateEdzesNapokDto extends PartialType(CreateEdzesNapokDto) {}
