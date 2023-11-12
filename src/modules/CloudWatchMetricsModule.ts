import { Module } from "@nestjs/common";
import { MetricCollector, MetricCollectorFactory } from "model-logging";


@Module({
  imports: [],
  providers: [
    {
      provide: MetricCollector,
      useFactory: () => {
        return MetricCollectorFactory.forFtrCloudwatch();
      },
      inject: []
    }
  ],
  exports: [MetricCollector]
})
export class CloudWatchMetricsModule {
}
