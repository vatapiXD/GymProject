import { Body, Controller, Post } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UserekService } from './userek.service';

@Controller()
export class AuthController {
  constructor(private readonly userekService: UserekService) {}

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.userekService.register(registerAuthDto);
  }

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.userekService.loginWithPlainPassword(loginAuthDto);
  }
}