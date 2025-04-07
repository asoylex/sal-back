// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Asegúrate de importar UserModule
import { JwtModule } from '@nestjs/jwt'; // Asegúrate de importar JwtModule
import { PassportModule } from '@nestjs/passport'; // Si estás usando Passport para autenticación

@Module({
  imports: [
    UserModule, // Si UserService está en UserModule
    PassportModule, // Si estás usando Passport
    JwtModule.register({
      secret: '6RUP054LIN45', // Usa una clave secreta fuerte (mejor en el entorno)
      signOptions: { expiresIn: '1h' }, // Tiempo de expiración del token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule], // Exporta AuthService para usarlo en otros módulos si es necesario
})
export class AuthModule {}
