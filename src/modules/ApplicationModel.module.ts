import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModel } from '../models/ApplicationModel.entity';
import { ApplicationModelsService } from '../services/ApplicationModel.service';
import { ApplicationModelController } from '../controllers/ApplicationModel.controller';
import { StreamController } from "../controllers/VideoStream.controller";
import { CloudWatchMetricsModule } from "model-logging/CloudWatchMetricsModule";

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationModel]),
    CloudWatchMetricsModule,
  ],
  providers: [ApplicationModelsService],
  controllers: [ApplicationModelController, StreamController],
})
export class ApplicationModelsModule {}
