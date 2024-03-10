import { Injectable } from "@nestjs/common";
import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import childProcess from "child_process";
import Ffmpeg from "fluent-ffmpeg";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);
const path = require("path");

@Injectable()
export class AnalysedVideoService {
  getVideoInfo(
    name: string,
  ): Promise<FfprobeData>{
    const videoPath = `uploads/converted/${name}/hls/${name}.m3u8`;

    return new Promise(resolve => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        resolve(metadata);
      });
    });
  }
}
