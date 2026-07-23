import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LegacyBridgeDto,
  MfaCodeDto,
  MfaVerifyDto,
  OnboardingUpdateDto,
  RegisterWorkspaceDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('legacy-bridge')
  legacyBridge(@Body() dto: LegacyBridgeDto) {
    return this.auth.bridgeWithLegacyToken(dto.legacyToken);
  }

  @Post('register')
  register(@Body() dto: RegisterWorkspaceDto) {
    return this.auth.register(dto);
  }

  @Post('mfa/verify')
  verifyMfa(@Body() dto: MfaVerifyDto) {
    return this.auth.verifyMfa(dto);
  }

  @Post('mfa/setup')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  setupMfa(@CurrentUser() user: JwtPayload) {
    return this.auth.setupMfa(user);
  }

  @Post('mfa/enable')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  enableMfa(@CurrentUser() user: JwtPayload, @Body() dto: MfaCodeDto) {
    return this.auth.enableMfa(user, dto);
  }

  @Post('mfa/disable')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  disableMfa(@CurrentUser() user: JwtPayload, @Body() dto: MfaCodeDto) {
    return this.auth.disableMfa(user, dto);
  }

  @Get('onboarding')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getOnboarding(@CurrentUser() user: JwtPayload) {
    return this.auth.getOnboarding(user);
  }

  @Post('onboarding')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateOnboarding(@CurrentUser() user: JwtPayload, @Body() dto: OnboardingUpdateDto) {
    return this.auth.updateOnboarding(user, dto);
  }

  @Post('onboarding/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  completeOnboarding(@CurrentUser() user: JwtPayload) {
    return this.auth.completeOnboarding(user);
  }
}
