import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.decorators';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserekDto } from './dto/update-userek.dto';
import { UserekService } from './userek.service';
@Controller('userek')
export class UserekController {
  constructor(private readonly service: UserekService) {}
  @Get('me') me(@CurrentUser() user: AuthUser) { return this.service.findOne(user.id); }
  @Patch('me') update(@Body() dto: UpdateUserekDto, @CurrentUser() user: AuthUser) { return this.service.update(user.id, dto); }
  @Patch('me/password') password(@Body() dto: ChangePasswordDto, @CurrentUser() user: AuthUser) { return this.service.changePassword(user.id, dto.currentPassword, dto.newPassword); }
}
