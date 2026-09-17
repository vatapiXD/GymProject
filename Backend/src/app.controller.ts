import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() @Get()
  @Render('index')
  getHello() {
    return { message: this.appService.getHello() };
  }
}
