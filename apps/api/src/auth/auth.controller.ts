import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginDto, LoginSchema, RegisterDto, RegisterSchema } from '@bookmark-manager/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';

const COOKIE_DEFAULTS = {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'strict' as const,
   path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @ApiOperation({ summary: 'Create a new account', description: 'Sets accessToken and refreshToken httpOnly cookies on success.' })
   @Throttle({ strict: { ttl: 60_000, limit: 10 } })
   @Post('register')
   async register(
      @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      const { user, ...tokens } = await this.authService.register(dto);
      this.setTokenCookies(res, tokens);
      return { user };
   }

   @ApiOperation({ summary: 'Sign in', description: 'Sets accessToken and refreshToken httpOnly cookies on success.' })
   @Throttle({ strict: { ttl: 60_000, limit: 10 } })
   @Post('login')
   async login(
      @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      const { user, ...tokens } = await this.authService.login(dto);
      this.setTokenCookies(res, tokens);
      return { user };
   }

   @ApiOperation({ summary: 'Refresh access token using the refreshToken cookie' })
   @Throttle({ strict: { ttl: 60_000, limit: 10 } })
   @Post('refresh')
   async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) throw new UnauthorizedException('No refresh token');

      const tokens = await this.authService.refresh(refreshToken);
      this.setTokenCookies(res, tokens);
      return { message: 'Tokens refreshed' };
   }

   @ApiOperation({ summary: 'Sign out and clear auth cookies' })
   @Post('logout')
   logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('accessToken', COOKIE_DEFAULTS);
      res.clearCookie('refreshToken', COOKIE_DEFAULTS);
      return { message: 'Logged out' };
   }

   private setTokenCookies(
      res: Response,
      { accessToken, refreshToken }: { accessToken: string; refreshToken: string },
   ) {
      res.cookie('accessToken', accessToken, {
         ...COOKIE_DEFAULTS,
         maxAge: 15 * 60 * 1000, // 15 min
      });
      res.cookie('refreshToken', refreshToken, {
         ...COOKIE_DEFAULTS,
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
   }
}
