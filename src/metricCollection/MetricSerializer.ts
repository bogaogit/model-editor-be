import { CloudWatchMetric } from './cloudwatch/CloudWatchMetricStore'

export interface MetricSerializer {
  build(
    metric: string,
    value: number,
    units: string,
    tags: Record<string, string>,
    millisSinceEpoch: number,
    namespace: string | undefined,
  ): string | CloudWatchMetric
}
