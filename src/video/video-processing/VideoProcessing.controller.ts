import { Body, Controller, Get, Header, Post } from "@nestjs/common";
import * as fs from "fs";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import { VideoProcessingService } from "./VideoProcessing.service";
import { ConvertFileAction } from "../file-scan/FileScan.model";
import { S3Service } from "../../aws/s3/S3.service";
import { TranscribeService } from "../../aws/transcribe/Transcribe.service";
import { ConvertedFileInfo } from "../file-scan/FileScan.entity";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);


@Controller("video-processing")
export class VideoProcessingController {
  constructor(
    private readonly videoProcessingService: VideoProcessingService,
  ) {
  }

  @Get("output.m3u8")
  @Header("Content-Type", "application/vnd.apple.mpegurl")
  play() {
    const playlistPath = join(__dirname, "..", "..", "uploads", "hls", "output.m3u8");
    const playlist = fs.readFileSync(playlistPath, "utf8");
    return playlist;

//     return `#EXTM3U
// #EXT-X-VERSION:3
// #EXT-X-TARGETDURATION:8
// #EXT-X-MEDIA-SEQUENCE:0
// #EXTINF:8.333322,
// output_000.ts
// #EXTINF:7.800000,
// output_001.ts
// #EXTINF:0.866656,
// output_002.ts
// #EXTINF:1.000000,
// output_003.ts
// #EXTINF:4.400000,
// output_004.ts
// `
  }

  /**
   * screen capture
   */
  // ffmpeg -y -rtbufsize 100M -f gdigrab -t 00:00:30 -framerate 30 -probesize 10M -draw_mouse 1 -i desktop -c:v libx264 -r 30 -preset ultrafast -tune zerolatency -crf 25 -pix_fmt yuv420p video_comapre2.mp4
  // ffmpeg -y -rtbufsize 100M -f gdigrab -t 00:00:30 -framerate 60 -probesize 10M -draw_mouse 1 -i desktop -c:v libx264 -r 30 -preset ultrafast -tune zerolatency -crf 25 -pix_fmt yuv420p audio="Microphone (USB Audio Device)" video_comapre2.mp4

  // with audio
  // ffmpeg -f dshow -i audio="Microphone (USB Audio Device)" -f gdigrab -framerate 30 -i desktop -c:v libx264 -preset ultrafast output.mp4

  @Post("start")
  async startStreaming() {
    await this.videoProcessingService.startStreaming();
  }

  @Post("end")
  async endStreaming() {
    await this.videoProcessingService.endStreaming();
  }

  @Post("process")
  async processVideo(
    @Body() requestBody: {
      convertFileAction: ConvertFileAction,
      convertedFileInfo: ConvertedFileInfo
    }
  ): Promise<ConvertedFileInfo> {
    return await this.videoProcessingService.processVideo(requestBody)
  }
}
