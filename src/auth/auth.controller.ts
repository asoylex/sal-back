import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // La ruta base será '/auth'
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') // La ruta completa es '/auth/login'
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}
