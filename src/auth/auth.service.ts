import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FIXFLOW_STORE } from '../storage/storage.token';
import { User } from '../storage/storage.interface';
import type { FixFlowStore } from '../storage/storage.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(FIXFLOW_STORE) private store: FixFlowStore,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    
    // Check duplicate
    if (this.store.users.find(u => u.email === email)) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser: User = {
      id: this.store.nextId.user++,
      fullName: dto.fullName,
      email,
      passwordHash,
      role: 'REQUESTER', // Public registration is ALWAYS requester
      categoryIds: [],
    };

    this.store.users.push(newUser);
    return { id: newUser.id, fullName: newUser.fullName, email: newUser.email, role: newUser.role };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = this.store.users.find(u => u.email === email);
    
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { access_token: token };
  }
}