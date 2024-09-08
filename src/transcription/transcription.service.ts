import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

export interface TranscriptionItem {
  time: number,
  transcription: string,
}

export interface TranscriptionResult {
  currentIndex: number,
  transcriptionItems: TranscriptionItem[],
}

@Injectable()
export class TranscriptionService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  async getRecordsByIndex(
    toIndex: number
  ): Promise<TranscriptionResult> {
    const records = []
    const currentIndex = parseInt(await this.redis.get("current_index", (err, result) => result));
    if (currentIndex > toIndex) {
      for (let index = toIndex + 1; index <= currentIndex; index++) {
        const record = await this.redis.get("index_" + index, (err, result) => result);
        records.push(JSON.parse(record))
      }
    }

    return {
      currentIndex,
      transcriptionItems: records
    }
  }
}
