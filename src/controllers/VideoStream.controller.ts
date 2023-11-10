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

    const videoPath = join(__dirname, '..','..', 'uploads', `output.mp4`);
    const outputPath = join(__dirname, '..', '..', 'uploads', `output.mp4`);
    const hlsOutputPath = join(__dirname, '..','..', 'uploads', 'hls', `${uuidv4()}.m3u8`);



    // ffmpeg -f dshow -i video="USB Video Device" out.mp4
    //
    // ffmpeg -f dshow -i video=”Lenovo EasyCamera” -vcodec libx264 -tune zerolatency -b 900k -f mpegts udp://localhost:1234

    const ffmpegProcess = spawn('ffmpeg', [
      '-f', 'dshow',
      '-i', 'video="USB Video Device"',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-vf', '"format=yuv420p"',
      '-f', 'hls',
      '-hls_time', '1',
      '-hls_list_size', '0',
      '-hls_segment_filename', '"output_%03d.ts"',
      '-hls_list_size', '0',
      'output.m3u8',
    ]);

    ffmpeg('Driver 0')
      .inputFormat('vfwcap')
      .output('output.mp4')
      .on('end', () => {
        console.log('Capture completed');
      })
      .on('error', (err) => {
        console.error('An error occurred:', err.message);
      })
      .run();


    // await new Promise((resolve, reject) => {
    //   ffmpeg(videoPath)
    //     .outputOptions(['-hls_time 1', '-hls_list_size 6', '-start_number 1'])
    //     .output(hlsOutputPath)
    //     .on('end', resolve)
    //     .on('error', reject)
    //     .run();
    // });
    //
    // ffmpegProcess.kill();

    return { message: 'Video streaming and upload completed' };
  }
}
