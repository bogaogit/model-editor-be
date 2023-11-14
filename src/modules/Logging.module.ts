import { Module } from "@nestjs/common";
import { CloudWatchMetricsModule } from "model-logging/CloudWatchMetricsModule";
import { LoggingService } from "../services/Logging.service";
import { LoggingController } from "../controllers/Logging.controller";

@Module({
  imports: [
    CloudWatchMetricsModule,
  ],
  providers: [LoggingService],
  controllers: [LoggingController],
})
export class LoggingModule {}
