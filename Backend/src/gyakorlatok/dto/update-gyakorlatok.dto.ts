import { PartialType } from '@nestjs/mapped-types';
import { CreateGyakorlatokDto } from './create-gyakorlatok.dto';

export class UpdateGyakorlatokDto extends PartialType(CreateGyakorlatokDto) {}
