import { Module } from "@nestjs/common";
import { RtspService } from "./Rtsp.service";
import { RtspController } from "./Rtsp.controller";

@Module({
  providers: [RtspService],
  controllers: [RtspController],
})
export class RtspModule {}
