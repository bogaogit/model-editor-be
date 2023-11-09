import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModel } from '../models/ApplicationModel.entity';
import { ApplicationModelsService } from '../services/ApplicationModel.service';
import { ApplicationModelController } from '../controllers/ApplicationModel.controller';
import { StreamController } from "../controllers/VideoStream.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationModel])],
  providers: [ApplicationModelsService],
  controllers: [ApplicationModelController, StreamController],
})
export class ApplicationModelsModule {}
