import { Body, Controller, Get, Post } from "@nestjs/common";
import { RtspService } from "./Rtsp.service";
import Stream from "node-rtsp-stream";

@Controller('rtsp')
export class RtspController {
  constructor(
    private readonly codeGenerationService: RtspService
  ) {
  }

  @Get()
  async playRtspContent(): Promise<void> {
    const streamUrl = 'rtsp://localhost:8554/live.stream';

// Configure stream options (optional)
    const streamOptions = {
      streamUrl: streamUrl,
      name: 'My RTSP Stream', // Optional stream name
      wsPort: 9999,
      ffmpegOptions: { // FFmpeg options for extracting audio
        '-vn': '', // Disable video processing
        '-acodec': 'copy', // Copy audio stream without re-encoding
      },
    };

    const stream = new Stream(streamOptions);

    stream.on('error', (error) => {
      console.error('Error:', error);
    });

    stream.on('data', (data) => {
      console.log(data)
      // Pipe the audio data to the audio player process
      // const audioPlayer = spawn('aplay', ['-', { shell: true }]);  // Adjust for your platform
      // audioPlayer.stdin.write(data);
      // audioPlayer.on('close', (code) => {
      //   if (code !== 0) {
      //     console.error('Audio player exited with code:', code);
      //   }
      // });
    });
  }
}
