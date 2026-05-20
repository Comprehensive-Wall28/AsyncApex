import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AsyncApex — Mini Jira API')
    .setDescription(
      `REST API for the AsyncApex task management platform.\n\n` +
      `**Auth flow:** Call \`POST /api/v1/auth/signin\` → copy the \`idToken\` → ` +
      `click **Authorize** and paste it as \`Bearer <idToken>\`.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the Cognito idToken returned by /auth/signin',
      },
      'cognito-jwt',
    )
    .addTag('Auth', 'Sign up, sign in, sign out — no token required')
    .addTag('Users', 'User management')
    .addTag('Teams', 'Team management')
    .addTag('Projects', 'Project management')
    .addTag('Tasks', 'Task CRUD with team isolation and GSI queries')
    .addTag('Comments', 'Task comments')
    .addTag('S3', 'File uploads and presigned URLs')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customJsStr: `
      (function () {
        try {
          var t = localStorage.getItem('swaggerToken');
          if (t) window._jwtToken = JSON.parse(t);
        } catch (_) {}

        var origFetch = window.fetch;
        window.fetch = function () {
          var args = Array.prototype.slice.call(arguments);
          if (window._jwtToken && typeof args[0] === 'string' && args[0].indexOf('/api/') !== -1) {
            if (!args[1]) args[1] = {};
            if (!args[1].headers) args[1].headers = {};
            if (!args[1].headers['Authorization']) {
              args[1].headers['Authorization'] = 'Bearer ' + window._jwtToken;
            }
          }
          return origFetch.apply(this, args).then(function (res) {
            res.clone().json().then(function (body) {
              if (body && body.idToken) {
                window._jwtToken = body.idToken;
                localStorage.setItem('swaggerToken', JSON.stringify(body.idToken));
              }
            }).catch(function () {});
            return res;
          });
        };
      })();
    `,
  });

  const port = process.env.PORT || 3000;
  const host = process.env.BACKEND_HOST || 'localhost'
  await app.listen(port, '0.0.0.0');
  console.log(`AsyncApex API  → http://${host}:${port}/api/v1`);
  console.log(`Swagger UI     → http://${host}:${port}/docs`);
}

bootstrap();
