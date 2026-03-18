import { randomUUID } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ErrorCode, LoginDto, RegisterDto } from '@bookmark-manager/types';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';

export interface TokenPair {
   accessToken: string;
   refreshToken: string;
   user: { id: string; email: string };
}

@Injectable()
export class AuthService {
   constructor(
      private prisma: PrismaService,
      private jwt: JwtService,
      private config: ConfigService,
   ) {}

   async register(dto: RegisterDto): Promise<TokenPair> {
      const existing = await this.prisma.user.findUnique({
         where: { email: dto.email },
      });
      if (existing) throw new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS);

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
         data: { email: dto.email, name: dto.name, passwordHash },
      });

      return this.issueTokens(user.id, user.email);
   }

   async login(dto: LoginDto): Promise<TokenPair> {
      const user = await this.prisma.user.findUnique({
         where: { email: dto.email },
      });
      if (!user) throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);

      const valid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!valid) throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);

      return this.issueTokens(user.id, user.email);
   }

   async refresh(refreshToken: string): Promise<TokenPair> {
      const stored = await this.prisma.refreshToken.findUnique({
         where: { token: refreshToken },
         include: { user: true },
      });

      if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
         throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
      }

      await this.prisma.refreshToken.update({
         where: { id: stored.id },
         data: { revokedAt: new Date() },
      });

      return this.issueTokens(stored.user.id, stored.user.email);
   }

   private async issueTokens(userId: string, email: string): Promise<TokenPair> {
      const payload: JwtPayload = { sub: userId, email };

      const accessToken = this.jwt.sign(payload, {
         expiresIn: this.config.get('JWT_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      });

      const rawRefresh = this.jwt.sign(
         { ...payload, jti: randomUUID() },
         {
            expiresIn: this.config.get(
               'JWT_REFRESH_EXPIRES_IN',
            ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
         },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.prisma.refreshToken.create({
         data: { token: rawRefresh, userId, expiresAt },
      });

      return { accessToken, refreshToken: rawRefresh, user: { id: userId, email } };
   }
}
