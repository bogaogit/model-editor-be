import { Controller, Get, Param } from "@nestjs/common";
import { TranscriptionResult, TranscriptionService } from "./transcription.service";

@Controller('transcription')
export class TranscriptionController {
  constructor(
    private readonly transcriptionService: TranscriptionService
  ) {
  }

  @Get(":index")
  async getRecordByIndex(@Param("index") index: string): Promise<TranscriptionResult> {
    return await this.transcriptionService.getRecordsByIndex(parseInt(index));
  }
}
