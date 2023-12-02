import { Injectable } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import { DirectoryUtils } from "../../utils/Directory.utils";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);

/*
ffmpeg -f dshow -i video="USB Video Device":audio="Microphone (USB Audio Device)"  -f hls -hls_time 1.00 -hls_list_size 0 -hls_segment_filename "D:\repo\model-editor-be\uploads\hls\output_%03d.ts" D:\repo\model-editor-be\uploads\hls\output.m3u8

 */

@Injectable()
export class VideoProcessingService {
  private command: any;

  async startStreaming() {
    this.command = ffmpeg()
      .input("audio=Microphone (USB Audio Device)")
      .inputOptions("-f dshow")
      .input("desktop")
      .inputOptions("-f gdigrab")
      .output("uploads/hls/output.m3u8")
      .outputOptions("-f hls")
      .outputOptions("-hls_time 1.00")
      .outputOptions("-hls_list_size 0")
      .outputOptions("-preset ultrafast")
      .on("start", () => {
        console.log("Screen capture and audio recording started");
      })
      .on("end", () => {
        console.log("Screen capture and audio recording end");
      });

    this.command.run();

  }

  async endStreaming() {
    return this.command.ffmpegProc.stdin.write("q");
  }

  async extractAudio(
    inputFilePath: string,
    fileName: string,
    inputFileType: string,
    callback?: () => void
  ) {
    const outputFolderPath = `uploads/converted/${fileName}/audio`;
    DirectoryUtils.createPathRecursively(outputFolderPath);

    ffmpeg()
      .input(`${inputFilePath}/${fileName}.${inputFileType}`)
      .outputOptions([
        "-vn",
        "-acodec", "copy"
      ])
      .output(`${outputFolderPath}/${fileName}.wav`)
      .on("progress", progress => {
        console.log(progress);
      })
      .on("end", () => {
        console.log("extract audio generated successfully.");
        if (callback) {
          callback();
        }
      })
      .on("error", (err) => {
        console.error("Error generating extract audio:", err);
      })
      .run();
  }

  async startScreenshots(
    inputFilePath: string,
    fileName: string,
    inputFileType: string,
    outputFileType: string,
    callback?: () => void
  ) {
    const outputFolderPath = `uploads/converted/${fileName}/screenshots`;
    DirectoryUtils.createPathRecursively(outputFolderPath);

    /**
     * Here,
     *
     * we use the select filter to extract a frame if the expression in single-quotes evaluates to non-zero. If the expression is zero, then select filter discards that frame.
     * mod(A,B) returns the modulus (remainder after division) result after dividing A by B. So, if we divide 0 by 300, we get 0. Then, 1/300 is 1, and so on.
     * not inverts this result. So, if the modulus is zero, then the final result is 1. If the modulus is non-zero, then the result is evaluated to zero.
     * Based on this not operation, the select filter picks up a frame.
     */

    /**
     *
     * Replace "input.mp4" with the name of your input video file. The `-vf "fps=1/5"` option sets the frame rate to 1 frame per 5 seconds, indicating that a screenshot will be taken every 5 seconds. Adjust the value if you want screenshots at a different interval.
     *
     * The `-q:v 2` option sets the quality of the output images. A lower value (e.g., 2) indicates higher quality, while a higher value (e.g., 10) indicates lower quality. You can adjust this value based on your preference.
     */
    let totalTime;
    ffmpeg()
      .input(`${inputFilePath}/${fileName}.${inputFileType}`)
      .outputOptions([
        "-vf", "fps=1/2",
        "-q:v", "0"
      ])
      .output(`${outputFolderPath}/${fileName}-%03d.${outputFileType}`)
      .on("progress", progress => {
        // HERE IS THE CURRENT TIME
        const time = parseInt(progress.timemark.replace(/:/g, ""));

        // AND HERE IS THE CALCULATION
        const percent = (time / totalTime) * 100;

        console.log(percent);
      })
      .on("end", () => {
        console.log("Screenshots generated successfully.");
        if (callback) {
          callback();
        }
      })
      .on("error", (err) => {
        console.error("Error generating screenshots:", err);
      })
      .run();
  }

  async convertToHls(
    inputFilePath: string,
    fileName: string,
    inputFileType: string,
    callback?: () => void
  ) {
    const outputFolderPath = `uploads/converted/${fileName}/hls`;
    DirectoryUtils.createPathRecursively(outputFolderPath);

    let totalTime;
    ffmpeg()
      .input(`${inputFilePath}/${fileName}.${inputFileType}`)
      .outputOptions([
        "-c:v", "libx264",
        "-crf", "21",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-hls_list_size", "0"
      ])
      .output(`${outputFolderPath}/${fileName}.m3u8`)
      .on("progress", progress => {
        // HERE IS THE CURRENT TIME
        const time = parseInt(progress.timemark.replace(/:/g, ""));

        // AND HERE IS THE CALCULATION
        const percent = (time / totalTime) * 100;

        console.log(percent);
      })
      .on("end", () => {
        console.log("hls generated successfully.");
        if (callback) {
          callback();
        }
      })
      .on("error", (err) => {
        console.error("Error generating hls:", err);
      })
      .run();
  }
}
