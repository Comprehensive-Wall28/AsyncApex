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
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`AsyncApex API  → http://localhost:${port}/api/v1`);
  console.log(`Swagger UI     → http://localhost:${port}/docs`);
}

bootstrap();
