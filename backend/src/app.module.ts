import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CommentsModule } from './modules/comments/comments.module';
import { S3Module } from './modules/s3/s3.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CloudWatchModule } from './modules/cloudwatch/cloudwatch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    S3Module,
    NotificationsModule,
    CloudWatchModule,
  ],
})
export class AppModule {}
