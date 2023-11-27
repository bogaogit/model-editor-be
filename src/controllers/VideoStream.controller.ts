import { Controller, Get, Header, Param, ParseUUIDPipe, Post, Res } from "@nestjs/common";
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from "fluent-ffmpeg";
import { spawn } from 'child_process';
import * as fs from "fs";

const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

/*
ffmpeg -f dshow -i video="USB Video Device":audio="Microphone (USB Audio Device)"  -f hls -hls_time 1.00 -hls_list_size 0 -hls_segment_filename "D:\repo\model-editor-be\uploads\hls\output_%03d.ts" D:\repo\model-editor-be\uploads\hls\output.m3u8

 */

@Controller('hls')
export class StreamController {
  @Get('output.m3u8')
  @Header('Content-Type', 'application/vnd.apple.mpegurl')
  play() {
    const playlistPath = join(__dirname, '..','..','uploads', 'hls', 'output.m3u8');
    const playlist = fs.readFileSync(playlistPath, 'utf8');
    return playlist

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

  @Post('start')
  async startStreaming() {
    // Run FFmpeg

    const videoPath = join(__dirname, '..','..', 'uploads', `output.mp4`);
    const outputPath = join(__dirname, '..', '..', 'uploads', `output.mp4`);
    const hlsOutputPath = join(__dirname, '..','..', 'uploads', 'hls', `${uuidv4()}.m3u8`);



    // ffmpeg -f dshow -i video="USB Video Device" out.mp4
    //
    // ffmpeg -f dshow -i video=”Lenovo EasyCamera” -vcodec libx264 -tune zerolatency -b 900k -f mpegts udp://localhost:1234

    // const ffmpegProcess = spawn('ffmpeg', [
    //   '-f', 'dshow',
    //   '-i', 'video="USB Video Device"',
    //   '-c:v', 'libx264',
    //   '-preset', 'ultrafast',
    //   '-tune', 'zerolatency',
    //   '-vf', '"format=yuv420p"',
    //   '-f', 'hls',
    //   '-hls_time', '1',
    //   '-hls_list_size', '0',
    //   '-hls_segment_filename', '"output_%03d.ts"',
    //   '-hls_list_size', '0',
    //   'output.m3u8',
    // ]);

    // ffmpeg.getAvailableFormats(function(err, formats) {
    //   console.log('Available formats:');
    //   console.dir(formats);
    // });

    ffmpeg('video=USB Video Device')
      .inputFormat('dshow')
      .outputOptions('-hls_time 5')
      .output('uploads/hls/output.m3u8')
      .on('start', () => {
        console.log('Capture start');
      })
      .on('end', () => {
        console.log('Capture completed');
      })
      .on('progress', function(progress) {
        console.log('Processing: ' + JSON.stringify(progress));
      })
      .on('stderr', function(stderrLine) {
        console.log('Stderr output: ' + JSON.stringify(stderrLine));
      })
      .on('error', (err) => {
        console.error('An error occurred:', err.message);
      })
      .on('codecData', function(data) {
        console.log('Input is ' + data.audio + ' audio ' +
          'with ' + data.video + ' video');
      })
      .run();



    return { message: 'Video streaming and upload completed' };
  }
}
