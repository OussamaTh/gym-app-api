import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserDocument } from '../users/schemas/user.schema.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';

const ACCESS_TTL = 15 * 60;              // 15 minutes, in seconds
const REFRESH_TTL = 30 * 24 * 60 * 60;   // 30 days, in seconds

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    if (await this.users.findByEmail(email)) throw new ConflictException('This email is already registered');

    const passwordHash = await argon2.hash(dto.password);
    try {
      const user = await this.users.create({
        email,
        passwordHash,
        firstName: dto.firstName?.trim() ?? '',
        lastName: dto.lastName?.trim() ?? '',
      });
      return this.issueTokens(user);
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('This email is already registered'); // two sign-ups at once
      throw e;
    }
  }

  async login(dto: LoginDto) {
    console.log("user is about to register in the gym app");
    const user = await this.users.findByEmail(dto.email);
    // One message for both cases, so nobody can tell which emails exist
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Wrong email or password');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') });
    } catch {
      throw new UnauthorizedException('Session expired. Log in again.');
    }

    const user = await this.users.findById(payload.sub);
    // The token must be the latest one we issued. An older (stolen or replayed) token fails here.
    if (!user?.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, refreshToken))) {
      throw new UnauthorizedException('Session expired. Log in again.');
    }
    return this.issueTokens(user); // rotation: a new pair, the old refresh token stops working
  }

  logout(userId: string) {
    return this.users.setRefreshHash(userId, null);
  }

  private async issueTokens(user: UserDocument) {
    const payload = { sub: user.id as string, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TTL,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TTL,
    });
    await this.users.setRefreshHash(user.id, await argon2.hash(refreshToken));
    return { user: this.users.toPublic(user), accessToken, refreshToken };
  }
}