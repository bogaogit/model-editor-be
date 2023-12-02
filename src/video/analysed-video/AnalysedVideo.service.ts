import { Injectable } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);
const path = require("path");

@Injectable()
export class AnalysedVideoService {

}
