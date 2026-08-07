import { PartialType } from '@nestjs/mapped-types';
import { CreateKajaDto } from './create-kaja.dto';

export class UpdateKajaDto extends PartialType(CreateKajaDto) {}
