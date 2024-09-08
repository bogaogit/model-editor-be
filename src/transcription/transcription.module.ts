import { Module } from "@nestjs/common";
import { TranscriptionService } from "./transcription.service";
import { TranscriptionController } from "./transcription.controller";

@Module({
  providers: [TranscriptionService],
  controllers: [TranscriptionController],
})
export class TranscriptionModule {}
