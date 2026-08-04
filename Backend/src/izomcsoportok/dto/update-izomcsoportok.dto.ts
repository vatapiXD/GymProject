import { PartialType } from '@nestjs/mapped-types';
import { CreateIzomcsoportokDto } from './create-izomcsoportok.dto';

export class UpdateIzomcsoportokDto extends PartialType(CreateIzomcsoportokDto) {}
