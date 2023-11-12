import { Module } from "@nestjs/common";
import { MetricCollector } from "./MetricCollector";
import { MetricCollectorFactory } from "./MetricCollectorFactory";

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
