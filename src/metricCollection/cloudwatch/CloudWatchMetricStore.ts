import {
  CloudWatchClient,
  ListMetricsCommand,
  PutMetricDataCommand,
  PutMetricDataCommandInput
} from "@aws-sdk/client-cloudwatch";
import { Dimension, StandardUnit } from '@aws-sdk/client-cloudwatch/dist-types/models/models_0'
import { MetricStore } from '../MetricStore'
import { cloudWatchClient } from "../../clients/Cloudwatch.client";

export interface CloudWatchMetric {
  namespace: string | undefined
  metricName: string | undefined
  dimensions: Dimension[] | undefined
  unit: StandardUnit | undefined
  value: number | undefined
}

export class CloudWatchMetricStore implements MetricStore {
  private client: CloudWatchClient

  constructor(region: string) {
    //@ts-ignore
    this.client = new CloudWatchClient({ region })
  }

  async ingest(metrics: CloudWatchMetric[]): Promise<void> {
    if (!metrics) return

    for (const metric of metrics) {
      // const metricData: PutMetricDataCommandInput = {
      //   Namespace: metric.namespace,
      //   MetricData: [
      //     {
      //       MetricName: metric.metricName,
      //       Dimensions: metric.dimensions,
      //       Unit: metric.unit,
      //       Value: metric.value,
      //     },
      //   ],
      // }

      const metricData: PutMetricDataCommandInput = {
        Namespace: "MyApp/Metrics9", // Replace "MyApp/Metrics" with your desired metric namespace
        MetricData: [
          {
            MetricName: "MyCustomMetric", // Replace "MyCustomMetric" with your desired metric name
            Dimensions: [
              { Name: "Environment", Value: "Production" }, // Add any extra dimensions as required
            ],
            Unit: "Count",
            Value: 700, // Set your desired metric value here
          },
        ],
      };

      // https://ap-southeast-2.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-2#metricsV2?graph=~(metrics~(~(~'MyApp*2fMetrics~'MyCustomMetric~'Environment~'Production))~sparkline~true~view~'timeSeries~stacked~false~region~'ap-southeast-2~start~'-PT3H~end~'P0D~stat~'Average~period~10)&query=~'*7bMyApp*2fMetrics*2cEnvironment*7d
      const command = new PutMetricDataCommand(metricData);

      try {
        const response = await this.client.send(command);
        console.log(response);
        console.log("Metrics data sent successfully.");
      } catch (error) {
        console.error("Failed to send metrics data.", error);
      }

    }
  }
}
