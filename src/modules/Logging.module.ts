import { Module } from "@nestjs/common";
import { CloudWatchMetricsModule } from "model-logging/CloudWatchMetricsModule";
import { LoggingService } from "../services/Logging.service";
import { LoggingController } from "../controllers/Logging.controller";
import { MetricCollector } from "../../../../repogitlab/model-logging/dist";

@Module({
  imports: [
    CloudWatchMetricsModule,
  ],
  providers: [LoggingService, MetricCollector],
  controllers: [LoggingController],
})
export class LoggingModule {}
