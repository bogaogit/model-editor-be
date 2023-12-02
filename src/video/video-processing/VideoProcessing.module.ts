import { Module } from "@nestjs/common";
import { VideoProcessingController } from "./VideoProcessing.controller";
import { VideoProcessingService } from "./VideoProcessing.service";

@Module({
  imports: [],
  providers: [VideoProcessingService],
  controllers: [VideoProcessingController]
})
export class VideoProcessingModule {
}
