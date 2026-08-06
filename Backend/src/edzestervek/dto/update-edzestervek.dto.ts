import { PartialType } from '@nestjs/mapped-types';
import { CreateEdzestervekDto } from './create-edzestervek.dto';

export class UpdateEdzestervekDto extends PartialType(CreateEdzestervekDto) {}
