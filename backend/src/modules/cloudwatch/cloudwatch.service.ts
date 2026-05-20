import { Injectable, Logger } from '@nestjs/common';
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { cloudWatchClient } from '../../config/aws.config';

@Injectable()
export class CloudWatchService {
  private readonly logger = new Logger(CloudWatchService.name);
  private readonly namespace = 'MiniJira';

  async publishTaskCreated(teamId: string): Promise<void> {
    try {
      await cloudWatchClient.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: 'TasksCreated',
              Dimensions: [{ Name: 'TeamId', Value: teamId }],
              Value: 1,
              Unit: 'Count',
            },
          ],
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to publish TasksCreated metric: ${err}`);
    }
  }

  async publishTaskClosed(teamId: string): Promise<void> {
    try {
      await cloudWatchClient.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: 'TasksClosed',
              Dimensions: [{ Name: 'TeamId', Value: teamId }],
              Value: 1,
              Unit: 'Count',
            },
          ],
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to publish TasksClosed metric: ${err}`);
    }
  }

  async publishTaskAssigned(teamId: string): Promise<void> {
    try {
      await cloudWatchClient.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: 'TasksAssignedPerTeam',
              Dimensions: [{ Name: 'TeamId', Value: teamId }],
              Value: 1,
              Unit: 'Count',
            },
          ],
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to publish TasksAssignedPerTeam metric: ${err}`);
    }
  }

  async publishAverageTimeToClose(hours: number, teamId: string): Promise<void> {
    try {
      await cloudWatchClient.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: 'AverageTimeToClose',
              Value: hours,
              Unit: 'None',
              Dimensions: [{ Name: 'TeamId', Value: teamId }],
            },
          ],
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to publish AverageTimeToClose metric: ${err}`);
    }
  }
}
