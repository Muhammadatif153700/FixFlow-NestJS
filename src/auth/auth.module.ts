import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    StorageModule,
    JwtModule.register({
      global: true, // Makes JwtService available everywhere without importing JwtModule again
      secret: 'SUPER_SECRET_DEMO_KEY', // In a real app, use process.env.JWT_SECRET
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}