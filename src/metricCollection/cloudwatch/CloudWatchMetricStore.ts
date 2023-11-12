import { CloudWatchClient, ListMetricsCommand, PutMetricDataCommandInput } from '@aws-sdk/client-cloudwatch'
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
        Namespace: "MyApp/Metrics6", // Replace "MyApp/Metrics" with your desired metric namespace
        MetricData: [
          {
            MetricName: "MyCustomMetric", // Replace "MyCustomMetric" with your desired metric name
            Dimensions: [
              { Name: "Environment", Value: "Production" }, // Add any extra dimensions as required
            ],
            Unit: "Count",
            Value: -200, // Set your desired metric value here
          },
        ],
      };

      const command: ListMetricsCommand = new ListMetricsCommand(metricData)

      try {
        const response = await cloudWatchClient.send(command);
        console.log(response);
        console.log("Metrics data sent successfully.");
      } catch (error) {
        console.error("Failed to send metrics data.", error);
      }

    }
  }
}
