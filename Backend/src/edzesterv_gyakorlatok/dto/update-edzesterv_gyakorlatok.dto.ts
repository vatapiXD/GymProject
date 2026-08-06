import { PartialType } from '@nestjs/mapped-types';
import { CreateEdzestervGyakorlatokDto } from './create-edzesterv_gyakorlatok.dto';

export class UpdateEdzestervGyakorlatokDto extends PartialType(CreateEdzestervGyakorlatokDto) {}
