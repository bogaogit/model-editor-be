// import { Logger } from '../Logger'
import { CloudWatchMetricSerializer } from './cloudwatch/CloudWatchMetricSerializer'
import { CloudWatchMetricStore } from './cloudwatch/CloudWatchMetricStore'
import { MetricCollector } from './MetricCollector'
import { MetricStore } from './MetricStore'
import { PrometheusMetricSerializer } from './PrometheusMetricSerializer'
import { SumoMetricStore } from './SumoMetricStore'

export class MetricCollectorFactory {
  /**
   * Creates a MetricCollector that sends prometheus metrics to SumoLogic.
   *
   * @param logger
   * @param sumoEndpoint Optionally supply a SumoLogic endpoint to send metrics to. If not supplied, the
   * FTR_LOGGING_ENDPOINT environment variable will be used. If that is not set either, metrics will be discarded.
   */
  static forFtrSumo(sumoEndpoint?: string): MetricCollector {
    const metricSerializer = new PrometheusMetricSerializer()

    let metricStore: MetricStore
    const resolvedSumoEndpoint = sumoEndpoint ?? process.env.FTR_LOGGING_ENDPOINT
    if (resolvedSumoEndpoint) {
      metricStore = new SumoMetricStore(resolvedSumoEndpoint, 'prometheus')
    } else {
      // logger.warn('No FTR_LOGGING_ENDPOINT configured, metrics will be discarded')
      metricStore = {
        ingest: () => Promise.resolve(),
      }
    }

    return new MetricCollector(metricSerializer, metricStore)
  }

  /**
   * Creates a CloudWatchMetricCollector that sends cloudwatch metrics to Cloudwatch.
   *
   * @param logger
   * AWS_REGION environment variable will be used. If that is not set either, metrics will be discarded.
   */
  static forFtrCloudwatch(): MetricCollector {
    const metricSerializer = new CloudWatchMetricSerializer()

    let metricStore: MetricStore
    const region = process.env.AWS_REGION
    if (region) {
      metricStore = new CloudWatchMetricStore(region)
    } else {
      // logger.warn('No AWS_REGION configured, metrics will be discarded')

      metricStore = {
        ingest: () => Promise.resolve(),
      }
    }

    return new MetricCollector(metricSerializer, metricStore)
  }
}
