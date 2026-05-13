import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID || '';

const jwksClient = jwksRsa({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

const verifyAsync = promisify<
  string,
  jwt.Secret | jwt.GetPublicKeyOrSecret,
  jwt.VerifyOptions,
  jwt.JwtPayload
>(jwt.verify as any);

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyAsync(token, getKey, { algorithms: ['RS256'] });

      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload['custom:role'],
        teamId: payload['custom:teamId'],
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
