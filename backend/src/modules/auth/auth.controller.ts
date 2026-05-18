import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates the user in Cognito and stores their profile in DynamoDB. No token required.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully', schema: { example: { message: 'User created successfully', userId: 'a1b2c3d4-...' } } })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in and get JWT tokens',
    description: 'Returns `accessToken`, `idToken`, and `refreshToken`. Use the **idToken** as the `Bearer` token for all protected endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication tokens',
    schema: { example: { accessToken: 'eyJra...', idToken: 'eyJra...', refreshToken: 'eyJjb...' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 409, description: 'User is already signed in' })
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign out',
    description: 'Clears the logged-in flag and invalidates the Cognito session. Pass the idToken as Bearer.',
  })
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  signout(@Req() req: any, @Body('email') email?: string) {
    const authHeader: string = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    return this.authService.signout(token, email);
  }
}
