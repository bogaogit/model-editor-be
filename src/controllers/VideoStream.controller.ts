import { Controller, Post } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from "fluent-ffmpeg";
import { spawn } from 'child_process';
import * as fs from "fs";

@Controller('stream')
export class StreamController {
  @Post('start')
  async startStreaming() {
    // const videoPath = join(__dirname, '..', '..', 'uploads', `sample.mp4`);

    const videoPath = join(__dirname, '..','..', 'uploads', `output.mp4`);
    const outputPath = join(__dirname, '..', '..', 'uploads', `output.mp4`);
    const hlsOutputPath = join(__dirname, '..','..', 'uploads', 'hls', `${uuidv4()}.m3u8`);

    // const stream = fs.createWriteStream('outputfile.divx');
    // FfmpegCommand(videoPath)
    //   .output(outputPath)
    //   .output(stream)
    //   .on('end', function() {
    //     console.log('Finished processing');
    //   })
    //   .run();


    // Start capturing video from the web camera using FFmpeg
    // ffmpeg -y -f vfwcap -r 25 -i 0 out.mp4
    const ffmpegProcess = spawn('ffmpeg', [
      '-f', 'v4l2',
      '-i', '/dev/video0',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov',
      '-y', videoPath,
    ]);

    // const ffmpegProcess = spawn('ffmpeg', [
    //   '-f', 'vfwcap',
    //   '-y', videoPath,
    //   '-r', '25',
    //   '-i', '0',
    // ]);

    // Convert the captured video to HLS format
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions(['-hls_time 10', '-hls_list_size 6', '-start_number 1'])
        .output(hlsOutputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Upload the HLS segments to the server
    // Implement your own logic here to upload the files to the server

    // Stop the FFmpeg process
    ffmpegProcess.kill();

    return { message: 'Video streaming and upload completed' };
  }
}
