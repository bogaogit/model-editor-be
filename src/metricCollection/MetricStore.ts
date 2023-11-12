import { CloudWatchMetric } from './cloudwatch/CloudWatchMetricStore'

export interface MetricStore {
  ingest(metrics: (string | CloudWatchMetric)[]): Promise<void>
}
