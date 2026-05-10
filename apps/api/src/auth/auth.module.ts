import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-change-in-prod',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RolesGuard],
  exports: [RolesGuard, JwtModule],
})
export class AuthModule {}
