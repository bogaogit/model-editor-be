import { Module } from "@nestjs/common";
import { VideoProcessingController } from "../controllers/VideoProcessing.controller";
import { VideoProcessingService } from "../services/VideoProcessing.service";

@Module({
  imports: [],
  providers: [VideoProcessingService],
  controllers: [VideoProcessingController]
})
export class VideoProcessingModule {
}
