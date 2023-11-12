import axios, { AxiosInstance } from 'axios'
import { MetricStore } from './MetricStore'

export const METRIC_STANDARDS_SUPPORTED_BY_SUMO = ['graphite', 'carbon2', 'prometheus'] as const
type MetricStandardSupportedBySumo = (typeof METRIC_STANDARDS_SUPPORTED_BY_SUMO)[number]

export class SumoMetricStore implements MetricStore {
  private readonly axiosInstance: AxiosInstance

  constructor(
    private readonly endpoint: string,
    private readonly standard: MetricStandardSupportedBySumo,
  ) {
    this.axiosInstance = axios.create()
  }

  async ingest(metrics: string[]): Promise<void> {
    await this.axiosInstance.post(this.endpoint, metrics.join('\n'), {
      headers: {
        ['Content-Type']: `application/vnd.sumologic.${this.standard}`,
      },
    })
  }
}
