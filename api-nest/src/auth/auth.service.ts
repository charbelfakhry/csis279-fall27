import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UniqueConstraintError } from 'sequelize';
import { PermissionsRepository } from '../permissions/permissions.repository.js';
import { UsersRepository } from '../users/users.repository.js';
import { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register({ password, ...user }: RegisterDto) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let created;
    try {
      created = await this.usersRepository.createWithPassword(user, passwordHash);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
    return this.session(created);
  }

  async login(email: string, password: string) {
    const found = await this.usersRepository.findByEmailWithPassword(email);

    // users created from the Users page have no password and can't log in
    if (!found?.passwordHash || !(await bcrypt.compare(password, found.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.session(found);
  }

  async getCurrentUser(userId: number) {
    const user = await this.getSessionUser(userId);
    if (!user) throw new UnauthorizedException('Your account no longer exists');
    return user;
  }

  private async session(user: { id: number; email: string }) {
    const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return { token, user: await this.getSessionUser(user.id) };
  }

  // profile, roles and permission codes, so the frontend can hide what the user can't do.
  // the API still checks every request on its own
  private async getSessionUser(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) return undefined;
    const permissions = await this.permissionsRepository.findCodesByUserId(userId);
    return { ...user, permissions };
  }
}
