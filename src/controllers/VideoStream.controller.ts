import { Controller, Get, Header, Param, ParseUUIDPipe, Post, Res } from "@nestjs/common";
import { createWriteStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { spawn } from "child_process";
import * as fs from "fs";

const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);
const path = require('path');

/*
ffmpeg -f dshow -i video="USB Video Device":audio="Microphone (USB Audio Device)"  -f hls -hls_time 1.00 -hls_list_size 0 -hls_segment_filename "D:\repo\model-editor-be\uploads\hls\output_%03d.ts" D:\repo\model-editor-be\uploads\hls\output.m3u8

 */

function createPathRecursively(dirPath) {
  const normalizedPath = path.normalize(dirPath);

  normalizedPath.split(path.sep).reduce((currentPath, folder) => {
    currentPath += folder + path.sep;
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }, '');
}

@Controller("hls")
export class StreamController {
  private command: any;
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
    /**
     * In this fluent-ffmpeg command, we use the `input` method to specify the audio input as `"Microphone (USB Audio Device)"` with the `-f dshow` input option. The desktop screen is set as the video input using the `input` method with the `-f gdigrab` input option. The output file is set to `output.mp4` and the video codec is set to `libx264` using the `outputOptions` method. Additionally, the `-preset ultrafast` option is added using the `outputOptions` method.
     */

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
      })

    this.command.run()
  }

  @Post("end")
  async endStreaming() {
      return this.command.ffmpegProc.stdin.write('q');
  }

  @Post("screenshots")
  async startScreenshots() {
    const inputFilePath = 'E:\\h14';
    const fileName = "2814829-480p"

    const outputFolderPath = `uploads/converted/${fileName}/screenshots`
    createPathRecursively(outputFolderPath);

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
    let totalTime
    ffmpeg()
      .input(`${inputFilePath}/${fileName}.mp4`)
      .outputOptions([
        '-vf', 'fps=1/2',
        '-q:v', '0'
      ])
      .output(`${outputFolderPath}/${fileName}-%03d.jpg`)
      .on('progress', progress => {
        // HERE IS THE CURRENT TIME
        const time = parseInt(progress.timemark.replace(/:/g, ''))

        // AND HERE IS THE CALCULATION
        const percent = (time / totalTime) * 100

        console.log(percent)
      })
      .on('end', () => {
        console.log('Screenshots generated successfully.');
      })
      .on('error', (err) => {
        console.error('Error generating screenshots:', err);
      })
      .run()
  }

  @Post("convertToHls")
  async convertToHls() {
    const inputFilePath = 'E:\\h14';
    const fileName = "2814829-480p"

    const outputFolderPath = `uploads/converted/${fileName}/hls`
    createPathRecursively(outputFolderPath);

    let totalTime
    ffmpeg()
      .input(`${inputFilePath}/${fileName}.mp4`)
      .outputOptions([
        '-c:v', 'libx264',
        '-crf', '21',
        '-preset', 'veryfast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-hls_time', '10',
        '-hls_list_size', '0'
      ])
      .output(`${outputFolderPath}/${fileName}.m3u8`)
      .on('progress', progress => {
        // HERE IS THE CURRENT TIME
        const time = parseInt(progress.timemark.replace(/:/g, ''))

        // AND HERE IS THE CALCULATION
        const percent = (time / totalTime) * 100

        console.log(percent)
      })
      .on('end', () => {
        console.log('hls generated successfully.');
      })
      .on('error', (err) => {
        console.error('Error generating hls:', err);
      })
      .run()
  }
}
