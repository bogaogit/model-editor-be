import { Controller, Get, Param } from "@nestjs/common";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { AnalysedVideoService } from "./AnalysedVideo.service";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);

type ProcessType = "all" | "hls" | "img" | "audio"

@Controller("analysed-video")
export class AnalysedVideoController {
  constructor(
    private readonly framesdVideoService: AnalysedVideoService
  ) {
  }

  @Get("images-info/:name")
  getImagesInfo(@Param("name") name: string) {
    const folderPath = `uploads/converted/${name}/screenshots`;
    fs.readdir(folderPath, (err, files) => {
      console.log(files);
    });
  }
}
