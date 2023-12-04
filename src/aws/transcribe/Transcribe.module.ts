import { Module } from "@nestjs/common";
import { TranscribeService } from "./Transcribe.service";
import { S3Module } from "../s3/S3.module";

@Module({
  imports: [S3Module],
  providers: [TranscribeService],
  exports: [TranscribeService]
})
export class TranscribeModule {
}
