import { Module } from "@nestjs/common";
import { AnalysedVideoController } from "./AnalysedVideo.controller";
import { AnalysedVideoService } from "./AnalysedVideo.service";

@Module({
  imports: [],
  providers: [AnalysedVideoService],
  controllers: [AnalysedVideoController],
  exports: [AnalysedVideoService]
})
export class AnalysedVideoModule {
}
