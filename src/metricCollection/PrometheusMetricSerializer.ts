import { MetricSerializer } from './MetricSerializer'

export class PrometheusMetricSerializer implements MetricSerializer {
  build(metric: string, value: number, units: string, tags: Record<string, string>, millisSinceEpoch: number): string {
    if (metric.trim() === '') {
      throw new Error('Metric name cannot be empty')
    }

    if (units.trim() === '') {
      throw new Error('Units cannot be empty')
    }

    return `${metric.trim()}_${units.trim()}{${Object.entries(tags)
      .map(([k, v]) => `${this.prepareLabelKey(k)}="${this.prepareLabelValue(v)}"`)
      .join(',')}} ${value} ${millisSinceEpoch}`
  }

  private prepareLabelKey(value: string): string {
    if (value.trim() === '') {
      throw new Error('Label key cannot be empty')
    }

    return value.trim().replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('=', '')
  }

  private prepareLabelValue(value: string): string {
    if (value.trim() === '') {
      throw new Error('Label value cannot be empty')
    }

    return value.trim().replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  }
}
