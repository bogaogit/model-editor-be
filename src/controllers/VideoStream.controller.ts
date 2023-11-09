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


    // const ffmpegProcess = spawn('ffmpeg', [
    //   '-f', 'v4l2',
    //   '-i', '/dev/video0',
    //   '-c:v', 'libx264',
    //   '-preset', 'ultrafast',
    //   '-tune', 'zerolatency',
    //   '-f', 'mp4',
    //   '-movflags', 'frag_keyframe+empty_moov',
    //   '-y', videoPath,
    // ]);

    await new Promise((resolve, reject) => {
      ffmpeg('sample-20s.mp4')
        .outputOptions(['-hls_time 1', '-hls_list_size 6', '-start_number 1'])
        .output(hlsOutputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // ffmpegProcess.kill();

    return { message: 'Video streaming and upload completed' };
  }
}
