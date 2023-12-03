import { Module } from "@nestjs/common";
import { VideoProcessingController } from "./VideoProcessing.controller";
import { VideoProcessingService } from "./VideoProcessing.service";
import { TranscribeModule } from "../../aws/transcribe/Transcribe.module";
import { S3Module } from "../../aws/s3/S3.module";

@Module({
  imports: [
    TranscribeModule,
    S3Module
  ],
  providers: [VideoProcessingService],
  controllers: [VideoProcessingController]
})
export class VideoProcessingModule {
}
