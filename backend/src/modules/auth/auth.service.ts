import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
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
  private readonly cognito: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;

  constructor(private readonly usersService: UsersService) {
    this.cognito = new CognitoIdentityProviderClient({
      region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1',
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID!;
    this.clientId = process.env.COGNITO_CLIENT_ID!;
  }

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

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
      if (err instanceof ConflictException) throw err;
      if (err.name === 'UsernameExistsException') {
        throw new ConflictException('Email already registered');
      }
      throw new BadRequestException(err.message || 'Signup failed');
    }
  }

  async signin(dto: SigninDto) {
    const dbUser = await this.usersService.findByEmail(dto.email);

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

      if (dbUser?.['userId']) {
        await this.usersService.setLoginStatus(dbUser['userId'], true);
      }

      return {
        accessToken: auth.AccessToken,
        idToken: auth.IdToken,
        refreshToken: auth.RefreshToken,
      };
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw new BadRequestException(err.message || 'Signin failed');
    }
  }

  async signout(token: string, email?: string) {
    let userId: string | undefined;

    if (token) {
      try {
        const decoded = jwt.decode(token) as Record<string, any> | null;
        if (decoded?.sub) userId = decoded.sub;
      } catch {}
    }

    if (!userId && email) {
      const user = await this.usersService.findByEmail(email);
      if (user) userId = user['userId'];
    }

    if (userId) {
      await this.usersService.setLoginStatus(userId, false);
    }

    if (token) {
      try {
        await this.cognito.send(new GlobalSignOutCommand({ AccessToken: token }));
      } catch {}
    }

    return { message: 'Signed out successfully' };
  }
}
