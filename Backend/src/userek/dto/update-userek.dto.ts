import { PartialType } from '@nestjs/mapped-types';
import { CreateUserekDto } from './create-userek.dto';

export class UpdateUserekDto extends PartialType(CreateUserekDto) {}
