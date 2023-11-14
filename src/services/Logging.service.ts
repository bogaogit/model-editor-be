import { Injectable } from "@nestjs/common";
import { mapTagsToDimensions, MetricCollector } from "model-logging";
import {
  GetMetricDataCommandInput,
  MetricDataResult,
  StandardUnit
} from "@aws-sdk/client-cloudwatch";

@Injectable()
export class LoggingService {
  constructor(
    private readonly metricCollector: MetricCollector
  ) {
  }

  private captureOptional(
    metric: string,
    value: number | undefined | null,
    units: StandardUnit,
    tags: Record<string, string> = {},
    namespace: string | undefined = "runtime_recorder"
  ): void {
    if (value) {
      this.metricCollector.capture(metric, value, units, tags, namespace);
    }
  }

  private async fetchMetric(
    id: string,
    metric: string,
    startTime: Date,
    endTime: Date,
    period: number,
    stat: string,
    tags: Record<string, string> = {},
    namespace: string | undefined = "runtime_recorder"
  ): Promise<(number | MetricDataResult)[]> {
    const input: GetMetricDataCommandInput = {
      StartTime: startTime,
      EndTime: endTime,
      MetricDataQueries: [{
        Id: id,
        MetricStat: {
          Metric: {
            Namespace: namespace,
            MetricName: metric,
            Dimensions: mapTagsToDimensions(tags),
          },
          Period: period,
          Stat: stat,
        },
      }],
    } as GetMetricDataCommandInput

    return this.metricCollector.getMetricData(input);
  }

  private captureStorageMetrics(value: number, prefix: string, tags: Record<string, string>): void {
    this.captureOptional(prefix + "storage:current-recording-size", value, "Bytes", tags);
    // this.captureOptional(prefix + 'storage:storage-free', metrics.freeStorageBytes, 'bytes', tags)
    // this.captureOptional(prefix + 'storage:storage-used', metrics.localStorageUsedBytes, 'bytes', tags)
  }

  capture(value: number): void {
    const tags: Record<string, string> = {
      tag1: "tag1"
    };

    this.captureStorageMetrics(value, "prefix", tags);
  }

  async fetch(): Promise<(number | MetricDataResult)[]> {
    const tags: Record<string, string> = {
      tag1: "tag1"
    };

    const profix = "prefix";

    return await this.fetchMetric(
      "currentRecordingSize",
      profix + "storage:current-recording-size",
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date(),
      5 * 50,
      'Minimum',
      tags
    )
  }
}
