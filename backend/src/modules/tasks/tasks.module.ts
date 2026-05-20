import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { S3Module } from '../s3/s3.module';
import { CloudWatchModule } from '../cloudwatch/cloudwatch.module';

@Module({
  imports: [NotificationsModule, UsersModule, S3Module, CloudWatchModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule { }