import { Module } from "@nestjs/common";
import { TranscribeService } from "./Transcribe.service";

@Module({
  providers: [TranscribeService],
  exports: [TranscribeService],
})
export class TranscribeModule {
}
