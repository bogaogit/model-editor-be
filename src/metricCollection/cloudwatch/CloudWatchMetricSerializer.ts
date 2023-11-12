import { Dimension, StandardUnit } from '@aws-sdk/client-cloudwatch/dist-types/models/models_0'
import { MetricSerializer } from '../MetricSerializer'
import { CloudWatchMetric } from './CloudWatchMetricStore'

export class CloudWatchMetricSerializer implements MetricSerializer {
  private mapTagsToDimensions(tags: Record<string, string> | undefined): Dimension[] {
    if (!tags) return []
    const dimensions: Dimension[] = []

    Object.entries(tags).forEach(([key, value]) => {
      dimensions.push({
        Name: key,
        Value: value,
      })
    })

    return dimensions
  }

  build(
    metric: string,
    value: number,
    units: StandardUnit,
    tags: Record<string, string>,
    millisSinceEpoch: number,
    namespace: string | undefined,
  ): CloudWatchMetric {
    if (metric.trim() === '') {
      throw new Error('Metric name cannot be empty')
    }

    if (units.trim() === '') {
      throw new Error('Units cannot be empty')
    }

    return {
      namespace,
      value,
      unit: units,
      dimensions: this.mapTagsToDimensions(tags),
      metricName: metric,
    }
  }
}
