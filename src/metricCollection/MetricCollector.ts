// import { Logger } from '../Logger'
import { MetricSerializer } from './MetricSerializer'
import { MetricStore } from './MetricStore'
import { CloudWatchMetric } from './cloudwatch/CloudWatchMetricStore'

interface MetricCollectorConfig {
  syncThrottleMs: number
  maxBatchSize: number
}

export type MetricCollectorOptions = Partial<MetricCollectorConfig>

export const DEFAULT_METRIC_COLLECTOR_CONFIG = {
  syncThrottleMs: 3_000,
  maxBatchSize: 1,
} as const satisfies MetricCollectorConfig

export class MetricCollector {
  private readonly config: MetricCollectorConfig
  private metricBatch: (string | CloudWatchMetric)[] = []
  private scheduledFlush?: NodeJS.Timeout

  constructor(
    private readonly metricSerializer: MetricSerializer,
    private readonly metricStore: MetricStore,
    // private readonly logger: Logger,
    options?: MetricCollectorOptions,
  ) {
    this.config = {
      ...DEFAULT_METRIC_COLLECTOR_CONFIG,
      ...options,
    }
  }

  capture(
    metric: string,
    value: number,
    units: string,
    tags: Record<string, string> = {},
    namespace: string | undefined,
  ): void {
    try {
      const builtMetric = this.metricSerializer.build(metric, value, units, tags, Date.now(), namespace)
      this.metricBatch.push(builtMetric)
    } catch (error) {
      // this.logger.error('Failed to build metric', { error })
    }

    console.log("this.metricBatch.length")
    console.log(this.metricBatch.length)

    if (this.metricBatch.length >= this.config.maxBatchSize) {
      void this.flush()
    } else if (!this.scheduledFlush) {
      this.scheduledFlush = setTimeout(() => {
        void this.flush()
      }, this.config.syncThrottleMs)
    }
  }

  async flush(): Promise<void> {
    clearTimeout(this.scheduledFlush)
    this.scheduledFlush = undefined

    if (this.metricBatch.length === 0) {
      return
    }
    const batch = this.metricBatch
    this.metricBatch = []

    try {
      await this.metricStore.ingest(batch)
    } catch (error) {
      // this.logger.error('Failed to store metrics', { error })
    }
  }
}
