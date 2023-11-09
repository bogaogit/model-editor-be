import { Controller, Post } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from "fluent-ffmpeg";
import { spawn } from 'child_process';
import * as fs from "fs";

const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

@Controller('stream')
export class StreamController {
  @Post('start')
  async startStreaming() {
    // Run FFmpeg
    ffmpeg()


      // Input file
      .input('video.mp4')

      // Scale the video to 720 pixels in height. The -2 means FFmpeg should figure out the
      // exact size of the other dimension. In other words, to make the video 720 pixels wide
      // and make FFmpeg calculate its height, use scale=720:-2 instead.
      .outputOptions('-vf','scale=-2:720')

      // Output file
      .saveToFile('video2.mp4')

      // Log the percentage of work completed
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })

      // The callback that is run when FFmpeg is finished
      .on('end', () => {
        console.log('FFmpeg has finished.');
      })

      // The callback that is run when FFmpeg encountered an error
      .on('error', (error) => {
        console.error(error);
      });

    return { message: 'Video streaming and upload completed' };
  }
}
