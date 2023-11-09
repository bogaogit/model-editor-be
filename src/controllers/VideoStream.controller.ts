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

      // Optional: Extract the frames at this frame rate
      // .fps(10)

      // Output file format. Frames are stored as frame-001.png, frame-002.png, frame-003.png, etc.
      .saveToFile('frame-%03d.png')

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