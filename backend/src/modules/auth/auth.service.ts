import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly cognito = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1',
  });

  private readonly userPoolId = process.env.COGNITO_USER_POOL_ID!;
  private readonly clientId = process.env.COGNITO_CLIENT_ID!;

  constructor(private readonly usersService: UsersService) {}

  async signup(dto: SignupDto) {
    const cognitoUsername = uuidv4();

    const userAttributes = [
      { Name: 'email', Value: dto.email },
      { Name: 'name', Value: dto.name },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'custom:role', Value: dto.role },
    ];

    if (dto.teamId) {
      userAttributes.push({ Name: 'custom:teamId', Value: dto.teamId });
    }

    try {
      const created = await this.cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: this.userPoolId,
          Username: cognitoUsername,
          TemporaryPassword: dto.password,
          UserAttributes: userAttributes,
          MessageAction: 'SUPPRESS',
        }),
      );

      const userId = created.User!.Attributes!.find((a) => a.Name === 'sub')!.Value!;

      await this.cognito.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.userPoolId,
          Username: cognitoUsername,
          Password: dto.password,
          Permanent: true,
        }),
      );

      await this.usersService.create({
        userId,
        email: dto.email,
        name: dto.name,
        role: dto.role,
        teamId: dto.teamId,
      });

      return { message: 'User created successfully', userId };
    } catch (err: any) {
      if (err.name === 'UsernameExistsException') {
        throw new BadRequestException('Email already in use');
      }
      throw new BadRequestException(err.message || 'Signup failed');
    }
  }

  async signin(dto: SigninDto) {
    try {
      const result = await this.cognito.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: this.clientId,
          AuthParameters: {
            USERNAME: dto.email,
            PASSWORD: dto.password,
          },
        }),
      );

      const auth = result.AuthenticationResult!;
      return {
        accessToken: auth.AccessToken,
        idToken: auth.IdToken,
        refreshToken: auth.RefreshToken,
      };
    } catch (err: any) {
      if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw new BadRequestException(err.message || 'Signin failed');
    }
  }

  async signout(accessToken: string) {
    if (!accessToken) return { message: 'Signed out' };
    try {
      await this.cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    } catch {
      // treat expired/invalid token as already signed out
    }
    return { message: 'Signed out successfully' };
  }
}
